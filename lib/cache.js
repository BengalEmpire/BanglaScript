const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class TranspilationCache {
  constructor(cacheDir = ".banglascript-cache", maxMemoryCacheSize = 200) {
    this.cacheDir = path.resolve(process.cwd(), cacheDir);
    this.memoryCache = new Map();
    this.maxMemoryCacheSize = maxMemoryCacheSize;
    this.enabled = true;
  }

  /**
   * Generate a secure hash for the source code and options
   */
  generateHash(code, options = {}) {
    const data = JSON.stringify({ code, options });
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Get cached transpilation result (with LRU update)
   */
  get(code, options = {}) {
    if (!this.enabled) return null;

    const hash = this.generateHash(code, options);

    // Check memory cache first
    if (this.memoryCache.has(hash)) {
      const cached = this.memoryCache.get(hash);
      // Re-insert to mark as recently used (LRU)
      this.memoryCache.delete(hash);
      this.memoryCache.set(hash, cached);
      return cached;
    }

    // Check disk cache
    try {
      const cacheFile = path.join(this.cacheDir, `${hash}.json`);
      if (fs.existsSync(cacheFile)) {
        const cached = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        this.setMemoryCache(hash, cached);
        return cached;
      }
    } catch {
      // Cache read failed, proceed without cache
    }

    return null;
  }

  /**
   * Set cache entry
   */
  set(code, options, result) {
    if (!this.enabled) return;

    const hash = this.generateHash(code, options);
    const cacheData = {
      code: result.code,
      map: result.map,
      timestamp: Date.now(),
      options,
    };

    // Set memory cache
    this.setMemoryCache(hash, cacheData);

    // Set disk cache asynchronously
    this.setDiskCacheAsync(hash, cacheData);
  }

  /**
   * Set memory cache with genuine LRU eviction
   */
  setMemoryCache(hash, data) {
    if (this.memoryCache.has(hash)) {
      this.memoryCache.delete(hash);
    } else if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      // Delete oldest accessed item
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) this.memoryCache.delete(oldestKey);
    }
    this.memoryCache.set(hash, data);
  }

  /**
   * Set disk cache asynchronously
   */
  setDiskCacheAsync(hash, data) {
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }

      const cacheFile = path.join(this.cacheDir, `${hash}.json`);
      fs.writeFile(cacheFile, JSON.stringify(data), "utf8", () => {
        // Silently complete
      });
    } catch {
      // Silently ignore disk write error
    }
  }

  /**
   * Clear all memory and disk caches
   */
  clear() {
    this.memoryCache.clear();
    try {
      if (fs.existsSync(this.cacheDir)) {
        const files = fs.readdirSync(this.cacheDir);
        for (const file of files) {
          try {
            fs.unlinkSync(path.join(this.cacheDir, file));
          } catch {
            // Ignore
          }
        }
      }
    } catch {
      // Silently ignore
    }
  }

  /**
   * Clear old cache entries (older than maxAge in milliseconds)
   */
  clearOld(maxAge = 7 * 24 * 60 * 60 * 1000) {
    try {
      if (!fs.existsSync(this.cacheDir)) return;

      const files = fs.readdirSync(this.cacheDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        try {
          const cached = JSON.parse(fs.readFileSync(filePath, "utf8"));
          if (now - cached.timestamp > maxAge) {
            fs.unlinkSync(filePath);
          }
        } catch {
          try {
            fs.unlinkSync(filePath);
          } catch {
            // Ignore
          }
        }
      }
    } catch {
      // Silently ignore
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let diskCacheCount = 0;
    let diskCacheSize = 0;

    try {
      if (fs.existsSync(this.cacheDir)) {
        const files = fs.readdirSync(this.cacheDir);
        diskCacheCount = files.length;
        for (const file of files) {
          const filePath = path.join(this.cacheDir, file);
          try {
            diskCacheSize += fs.statSync(filePath).size;
          } catch {
            // Ignore
          }
        }
      }
    } catch {
      // Silently ignore
    }

    return {
      memoryCacheCount: this.memoryCache.size,
      memoryCacheLimit: this.maxMemoryCacheSize,
      diskCacheCount,
      diskCacheSize,
      diskCacheSizeMB: (diskCacheSize / (1024 * 1024)).toFixed(2),
      enabled: this.enabled,
    };
  }

  /**
   * Enable or disable cache
   */
  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }
}

// Singleton instance
const cacheInstance = new TranspilationCache();

module.exports = { TranspilationCache, cacheInstance };