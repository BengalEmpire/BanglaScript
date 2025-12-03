const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class TranspilationCache {
  constructor(cacheDir = ".banglascript-cache") {
    this.cacheDir = path.join(process.cwd(), cacheDir);
    this.memoryCache = new Map();
    this.maxMemoryCacheSize = 100;
    this.enabled = true;
  }

  /**
   * Generate a hash for the source code
   */
  generateHash(code, options = {}) {
    const data = JSON.stringify({ code, options });
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Get cached transpilation result
   */
  get(code, options = {}) {
    if (!this.enabled) return null;

    const hash = this.generateHash(code, options);

    // Check memory cache first
    if (this.memoryCache.has(hash)) {
      return this.memoryCache.get(hash);
    }

    // Check disk cache
    try {
      const cacheFile = path.join(this.cacheDir, `${hash}.json`);
      if (fs.existsSync(cacheFile)) {
        const cached = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        
        // Store in memory cache for faster subsequent access
        this.setMemoryCache(hash, cached);
        
        return cached;
      }
    } catch (error) {
      // Cache read failed, continue without cache
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
   * Set memory cache with LRU eviction
   */
  setMemoryCache(hash, data) {
    // If cache is full, remove oldest entry
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
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
      
      // Write asynchronously to not block
      fs.writeFile(cacheFile, JSON.stringify(data), "utf8", (err) => {
        if (err) {
          // Silently fail - caching is not critical
        }
      });
    } catch (error) {
      // Silently fail
    }
  }

  /**
   * Clear all caches
   */
  clear() {
    this.memoryCache.clear();

    try {
      if (fs.existsSync(this.cacheDir)) {
        const files = fs.readdirSync(this.cacheDir);
        files.forEach((file) => {
          fs.unlinkSync(path.join(this.cacheDir, file));
        });
        fs.rmdirSync(this.cacheDir);
      }
    } catch (error) {
      // Silently fail
    }
  }

  /**
   * Clear old cache entries (older than maxAge in milliseconds)
   */
  clearOld(maxAge = 7 * 24 * 60 * 60 * 1000) {
    // 7 days default
    try {
      if (!fs.existsSync(this.cacheDir)) return;

      const files = fs.readdirSync(this.cacheDir);
      const now = Date.now();

      files.forEach((file) => {
        const filePath = path.join(this.cacheDir, file);
        try {
          const cached = JSON.parse(fs.readFileSync(filePath, "utf8"));
          if (now - cached.timestamp > maxAge) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          // Invalid cache file, remove it
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      // Silently fail
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
        files.forEach((file) => {
          const filePath = path.join(this.cacheDir, file);
          diskCacheSize += fs.statSync(filePath).size;
        });
      }
    } catch (error) {
      // Silently fail
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
    this.enabled = enabled;
  }
}

// Singleton instance
const cacheInstance = new TranspilationCache();

module.exports = { TranspilationCache, cacheInstance };