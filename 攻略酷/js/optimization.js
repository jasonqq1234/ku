// 性能監控
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.initPerformanceObserver();
    }

    // 初始化性能觀察器
    initPerformanceObserver() {
        // 觀察頁面載入性能
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.metrics[entry.name] = entry.startTime;
            }
        });

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

        // 觀察長任務
        const longTaskObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.warn('Long Task detected:', entry.duration);
            }
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
    }

    // 記錄性能指標
    logMetrics() {
        const navigationTiming = performance.getEntriesByType('navigation')[0];
        const metrics = {
            // 導航計時
            pageLoadTime: navigationTiming.loadEventEnd - navigationTiming.startTime,
            domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime,
            firstPaint: this.metrics['first-paint'],
            firstContentfulPaint: this.metrics['first-contentful-paint'],
            largestContentfulPaint: this.metrics['largest-contentful-paint'],

            // 資源計時
            resourceCount: performance.getEntriesByType('resource').length,
            resourceLoadTime: this.calculateResourceLoadTime(),

            // 記憶體使用
            jsHeapSize: performance.memory?.usedJSHeapSize,
        };

        console.table(metrics);
        return metrics;
    }

    // 計算資源載入時間
    calculateResourceLoadTime() {
        const resources = performance.getEntriesByType('resource');
        return resources.reduce((total, resource) => total + resource.duration, 0);
    }

    // 清除性能數據
    clearMetrics() {
        performance.clearMarks();
        performance.clearMeasures();
        performance.clearResourceTimings();
        this.metrics = {};
    }
}

// 資源優化
class ResourceOptimizer {
    constructor() {
        this.imageObserver = null;
        this.initLazyLoading();
    }

    // 初始化延遲載入
    initLazyLoading() {
        this.imageObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px 0px',
                threshold: 0.01
            }
        );

        document.querySelectorAll('img[data-src]').forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    // 載入圖片
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // 預載入圖片
        const preloadImage = new Image();
        preloadImage.onload = () => {
            img.src = src;
            img.classList.add('loaded');
        };
        preloadImage.src = src;
    }

    // 預取資源
    prefetchResources(urls) {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    // 預連接
    preconnect(urls) {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            document.head.appendChild(link);
        });
    }
}

// 快取管理
class CacheManager {
    constructor() {
        this.cacheName = 'guidetrade-cache-v1';
        this.initServiceWorker();
    }

    // 初始化 Service Worker
    async initServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('ServiceWorker registered:', registration);
            } catch (error) {
                console.error('ServiceWorker registration failed:', error);
            }
        }
    }

    // 快取資源
    async cacheResources(urls) {
        const cache = await caches.open(this.cacheName);
        await cache.addAll(urls);
    }

    // 清除舊快取
    async clearOldCaches() {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames
                .filter(name => name !== this.cacheName)
                .map(name => caches.delete(name))
        );
    }
}

// 錯誤追蹤
class ErrorTracker {
    constructor() {
        this.errors = [];
        this.initErrorHandling();
    }

    // 初始化錯誤處理
    initErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'error',
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason.message,
                stack: event.reason.stack
            });
        });
    }

    // 記錄錯誤
    logError(error) {
        this.errors.push({
            ...error,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });

        // 可以在這裡添加錯誤報告邏輯
        console.error('Error logged:', error);
    }

    // 獲取錯誤報告
    getErrorReport() {
        return {
            errors: this.errors,
            summary: {
                total: this.errors.length,
                types: this.errors.reduce((acc, error) => {
                    acc[error.type] = (acc[error.type] || 0) + 1;
                    return acc;
                }, {})
            }
        };
    }
}

// 初始化優化工具
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor();
    window.resourceOptimizer = new ResourceOptimizer();
    window.cacheManager = new CacheManager();
    window.errorTracker = new ErrorTracker();

    // 預連接常用域名
    resourceOptimizer.preconnect([
        'https://fonts.googleapis.com',
        'https://cdn.example.com'
    ]);

    // 監控性能
    setInterval(() => {
        const metrics = performanceMonitor.logMetrics();
        // 可以在這裡添加性能報告邏輯
    }, 60000);
});