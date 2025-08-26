document.addEventListener('DOMContentLoaded', function() {
    // 初始化排行榜分類標籤切換
    const tabButtons = document.querySelectorAll('.tab-btn');
    const leaderboardSections = document.querySelectorAll('.leaderboard-section');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有標籤的 active 狀態
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // 為當前點擊的標籤添加 active 狀態
            button.classList.add('active');

            // 隱藏所有排行榜區塊
            leaderboardSections.forEach(section => section.classList.remove('active'));
            // 顯示對應的排行榜區塊
            const targetTab = button.dataset.tab;
            const targetSection = document.getElementById(`${targetTab}-board`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // 初始化時間範圍選擇
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateLeaderboard(button.dataset.timeRange);
        });
    });

    // 更新排行榜數據
    function updateLeaderboard(timeRange) {
        // 這裡將來會根據選擇的時間範圍從後端獲取數據
        console.log(`Fetching data for time range: ${timeRange}`);
    }

    // 初始化收益圖表（使用 Chart.js）
    function initEarningsChart() {
        const ctx = document.getElementById('earningsChart');
        if (!ctx) return;

        // 這裡將來會從後端獲取實際數據
        const data = {
            labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
            datasets: [{
                label: '收益趨勢',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        };

        new Chart(ctx, config);
    }

    // 創作者卡片懸停效果
    const creatorCards = document.querySelectorAll('.creator-card');
    creatorCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // 排名列表項目懸停效果
    const rankingItems = document.querySelectorAll('.ranking-item');
    rankingItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(10px)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
    });

    // 攻略卡片懸停效果
    const guideCards = document.querySelectorAll('.guide-card');
    guideCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // 初始化工具提示
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', (e) => {
            const tip = document.createElement('div');
            tip.className = 'tooltip';
            tip.textContent = e.target.dataset.tooltip;
            document.body.appendChild(tip);

            const rect = e.target.getBoundingClientRect();
            tip.style.top = rect.top - tip.offsetHeight - 10 + 'px';
            tip.style.left = rect.left + (rect.width - tip.offsetWidth) / 2 + 'px';
        });

        tooltip.addEventListener('mouseleave', () => {
            const tip = document.querySelector('.tooltip');
            if (tip) tip.remove();
        });
    });

    // 初始化排行榜
    function initLeaderboard() {
        // 設置默認的排行榜分類和時間範圍
        const defaultTab = document.querySelector('.tab-btn[data-target="creators"]');
        const defaultTime = document.querySelector('.time-btn[data-time-range="week"]');
        
        if (defaultTab) defaultTab.click();
        if (defaultTime) defaultTime.click();
        
        // 初始化收益圖表
        initEarningsChart();
    }

    // 啟動初始化
    initLeaderboard();
});