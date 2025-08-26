const CACHE_NAME = 'guidetrade-cache-v1';
const STATIC_CACHE_NAME = 'guidetrade-static-v1';
const DYNAMIC_CACHE_NAME = 'guidetrade-dynamic-v1';

// 需要快取的靜態資源
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/explore.html',
    '/guide-detail.html',
    '/publish.html',
    '/login.html',
    '/signup.html',
    '/profile.html',
    '/settings.html',
    '/leaderboard.html',
    '/css/style.css',
    '/css/explore.css',
    '/css/publish.css',
    '/css/user.css',
    '/css/leaderboard.css',
    '/css/animations.css',
    '/js/main.js',
    '/js/publish.js',
    '/js/user.js',
    '/js/leaderboard.js',
    '/js/animations.js',
    '/js/optimization.js',
    '/images/logo.svg',
    '/images/default-avatar.svg',
    '/offline.html'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            // 快取靜態資源
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            }),
            // 快取離線頁面
            caches.open(CACHE_NAME).then((cache) => {
                return cache.add('/offline.html');
            })
        ])
    );
});

// 啟動 Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        // 清除舊的快取
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => {
                        return name.startsWith('guidetrade-') &&
                               name !== CACHE_NAME &&
                               name !== STATIC_CACHE_NAME &&
                               name !== DYNAMIC_CACHE_NAME;
                    })
                    .map((name) => caches.delete(name))
            );
        })
    );
});

// 處理請求
self.addEventListener('fetch', (event) => {
    // 跳過不支援的請求
    if (!event.request.url.startsWith('http')) return;
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 如果在快取中找到響應，則返回快取的版本
                if (response) {
                    // 同時在背景更新快取
                    fetch(event.request).then((fetchResponse) => {
                        if (fetchResponse) {
                            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                                cache.put(event.request, fetchResponse.clone());
                            });
                        }
                    });
                    return response;
                }

                // 如果不在快取中，則從網路獲取
                return fetch(event.request)
                    .then((fetchResponse) => {
                        // 檢查是否收到有效的響應
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        // 將響應添加到快取中
                        const responseToCache = fetchResponse.clone();
                        caches.open(DYNAMIC_CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return fetchResponse;
                    })
                    .catch(() => {
                        // 如果是頁面請求且失敗，返回離線頁面
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

// 後台同步
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-guides') {
        event.waitUntil(
            // 同步離線保存的攻略
            syncGuides()
        );
    }
});

// 推送通知
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/images/logo.svg',
        badge: '/images/badge.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '查看攻略',
                icon: '/images/checkmark.svg'
            },
            {
                action: 'close',
                title: '關閉',
                icon: '/images/close.svg'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('GuideTrade 通知', options)
    );
});

// 處理通知點擊
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/explore.html')
        );
    }
});

// 同步離線數據
async function syncGuides() {
    try {
        const db = await openDB();
        const guides = await db.getAll('offlineGuides');
        
        for (const guide of guides) {
            try {
                await fetch('/api/guides', {
                    method: 'POST',
                    body: JSON.stringify(guide),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                await db.delete('offlineGuides', guide.id);
            } catch (error) {
                console.error('同步攻略失敗:', error);
            }
        }
    } catch (error) {
        console.error('訪問 IndexedDB 失敗:', error);
    }
}

// 打開 IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('GuideTrade', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offlineGuides')) {
                db.createObjectStore('offlineGuides', { keyPath: 'id' });
            }
        };
    });
}