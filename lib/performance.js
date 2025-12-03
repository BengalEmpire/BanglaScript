class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.enabled = process.env.BANGLASCRIPT_PROFILE === "1";
    }

    start(name) {
        if (!this.enabled) return;

        if (!this.metrics[name]) {
            this.metrics[name] = {
                count: 0,
                totalTime: 0,
                minTime: Infinity,
                maxTime: 0,
                avgTime: 0,
            };
        }

        this.metrics[name].startTime = process.hrtime.bigint();
    }

    /**
     * End timing an operation
     */
    end(name) {
        if (!this.enabled || !this.metrics[name]?.startTime) return;

        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - this.metrics[name].startTime) / 1_000_000; // Convert to ms

        const metric = this.metrics[name];
        metric.count++;
        metric.totalTime += duration;
        metric.minTime = Math.min(metric.minTime, duration);
        metric.maxTime = Math.max(metric.maxTime, duration);
        metric.avgTime = metric.totalTime / metric.count;

        delete metric.startTime;

        return duration;
    }

    /**
     * Get all metrics
     */
    getMetrics() {
        return this.metrics;
    }

    /**
     * Print metrics report
     */
    printReport() {
        if (!this.enabled || Object.keys(this.metrics).length === 0) return;

        console.log("\n📊 Performance Report:");
        console.log("─".repeat(80));

        for (const [name, metric] of Object.entries(this.metrics)) {
            console.log(`\n${name}:`);
            console.log(`  Count: ${metric.count}`);
            console.log(`  Total: ${metric.totalTime.toFixed(2)}ms`);
            console.log(`  Average: ${metric.avgTime.toFixed(2)}ms`);
            console.log(`  Min: ${metric.minTime.toFixed(2)}ms`);
            console.log(`  Max: ${metric.maxTime.toFixed(2)}ms`);
        }

        console.log("\n" + "─".repeat(80));
    }

    /**
     * Reset all metrics
     */
    reset() {
        this.metrics = {};
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

/**
 * Memoization decorator for functions
 */
function memoize(fn, options = {}) {
    const cache = new Map();
    const maxSize = options.maxSize || 1000;

    return function (...args) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn.apply(this, args);

        // LRU eviction
        if (cache.size >= maxSize) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        cache.set(key, result);
        return result;
    };
}

/**
 * Debounce function to limit execution rate
 */
function debounce(fn, delay = 300) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Throttle function to ensure minimum interval between executions
 */
function throttle(fn, interval = 100) {
    let lastTime = 0;

    return function (...args) {
        const now = Date.now();

        if (now - lastTime >= interval) {
            lastTime = now;
            return fn.apply(this, args);
        }
    };
}

/**
 * Lazy initialization wrapper
 */
function lazy(initializer) {
    let value;
    let initialized = false;

    return () => {
        if (!initialized) {
            value = initializer();
            initialized = true;
        }
        return value;
    };
}

/**
 * Batch processing utility
 */
class BatchProcessor {
    constructor(processor, options = {}) {
        this.processor = processor;
        this.batchSize = options.batchSize || 10;
        this.delay = options.delay || 100;
        this.queue = [];
        this.timeoutId = null;
    }

    add(item) {
        this.queue.push(item);

        if (this.queue.length >= this.batchSize) {
            this.flush();
        } else {
            this.scheduleFlush();
        }
    }

    scheduleFlush() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(() => this.flush(), this.delay);
    }

    flush() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        if (this.queue.length === 0) return;

        const batch = this.queue.splice(0, this.queue.length);
        this.processor(batch);
    }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = {
    PerformanceMonitor,
    performanceMonitor,
    memoize,
    debounce,
    throttle,
    lazy,
    BatchProcessor,
};
