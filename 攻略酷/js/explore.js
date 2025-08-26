// 探索頁面功能
document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const priceSlider = document.querySelector('.price-slider');
    const priceCurrentValue = document.querySelector('.price-current');
    const sortSelect = document.querySelector('.sort-select');
    const guidesGrid = document.querySelector('.guides-grid');
    
    // 從localStorage獲取上傳的文章
    let articles = JSON.parse(localStorage.getItem('articles')) || [];
    
    // 當前篩選狀態
    let currentFilters = {
        search: '',
        category: 'all',
        maxPrice: 1000,
        sort: 'popular'
    };
    
    // 初始化頁面
    initPage();
    
    // 初始化頁面
    function initPage() {
        // 清空現有的攻略卡片
        guidesGrid.innerHTML = '';
        
        // 篩選出已審核通過的文章
        const approvedArticles = articles.filter(article => article.status === '已發布');
        
        // 如果沒有已審核通過的文章，顯示提示訊息
        if (approvedArticles.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.innerHTML = `
                <h3>目前沒有可用的攻略</h3>
                <p>請前往管理頁面上傳攻略，或稍後再查看。</p>
            `;
            guidesGrid.appendChild(emptyMessage);
            return;
        }
        
        // 渲染已審核通過的文章
        approvedArticles.forEach(article => {
            const guideCard = createGuideCard(article);
            guidesGrid.appendChild(guideCard);
        });
        
        // 儲存所有攻略卡片
        allGuides = Array.from(document.querySelectorAll('.guide-card'));
    }
    
    // 創建攻略卡片
    function createGuideCard(article) {
        const card = document.createElement('div');
        card.className = 'guide-card';
        
        // 格式化日期
        const createdDate = article.createdAt ? new Date(article.createdAt).toLocaleDateString() : '未知';
        
        // 設置價格，如果沒有則默認為免費
        const price = article.price ? `NT$${article.price}` : '免費';
        
        card.innerHTML = `
            <div class="guide-image">
                <img src="${article.imagePath || 'images/guide-1.jpg'}" alt="${article.title}">
                <div class="guide-category game">攻略</div>
                <div class="guide-price">${price}</div>
            </div>
            <div class="guide-info">
                <h3>${article.title}</h3>
                <div class="guide-meta">
                    <div class="author">
                        <img src="images/avatar-1.jpg" alt="作者頭像">
                        <span>${article.author}</span>
                    </div>
                    <div class="date">${createdDate}</div>
                </div>
                <div class="guide-rating">
                    <div class="stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                    </div>
                    <span>(4.5)</span>
                </div>
                <div class="guide-actions">
                    <a href="guide-detail.html?id=${article.id}" class="btn btn-primary btn-sm">查看</a>
                    ${article.price ? `<button class="btn btn-success btn-sm buy-btn" data-id="${article.id}">購買</button>` : ''}
                </div>
            </div>
        `;
        
        return card;
    }
    
    // 搜尋功能
    function handleSearch() {
        currentFilters.search = searchInput.value.toLowerCase().trim();
        applyFilters();
    }
    
    // 類別篩選
    function handleCategoryFilter(category) {
        currentFilters.category = category.toLowerCase();
        
        // 更新按鈕狀態
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === category.toLowerCase() || 
                (category.toLowerCase() === 'all' && btn.textContent === '全部')) {
                btn.classList.add('active');
            }
        });
        
        applyFilters();
    }
    
    // 價格篩選
    function handlePriceFilter(maxPrice) {
        currentFilters.maxPrice = maxPrice;
        priceCurrentValue.textContent = `NT$${maxPrice}`;
        applyFilters();
    }
    
    // 排序功能
    function handleSort(sortBy) {
        currentFilters.sort = sortBy;
        applyFilters();
    }
    
    // 應用所有篩選條件
    function applyFilters() {
        // 重新渲染攻略列表
        initPage();
        
        // 獲取所有攻略卡片
        allGuides = Array.from(document.querySelectorAll('.guide-card'));
        
        // 應用搜尋篩選
        if (currentFilters.search) {
            allGuides.forEach(guide => {
                const title = guide.querySelector('h3').textContent.toLowerCase();
                const author = guide.querySelector('.author span').textContent.toLowerCase();
                
                if (!title.includes(currentFilters.search) && !author.includes(currentFilters.search)) {
                    guide.style.display = 'none';
                }
            });
        }
        
        // 應用類別篩選
        if (currentFilters.category !== 'all') {
            allGuides.forEach(guide => {
                const category = guide.querySelector('.guide-category').textContent.toLowerCase();
                if (category !== currentFilters.category) {
                    guide.style.display = 'none';
                }
            });
        }
        
        // 檢查是否有可見的攻略卡片
        const visibleGuides = allGuides.filter(guide => guide.style.display !== 'none');
        
        if (visibleGuides.length === 0) {
            const noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results-message';
            noResultsMessage.innerHTML = `
                <h3>沒有符合條件的攻略</h3>
                <p>請嘗試調整搜尋條件或篩選器。</p>
            `;
            guidesGrid.appendChild(noResultsMessage);
        }
    }
    
    // 事件監聽器
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.textContent === '全部' ? 'all' : this.textContent;
            handleCategoryFilter(category);
        });
    });
    
    if (priceSlider) {
        priceSlider.addEventListener('input', function() {
            handlePriceFilter(this.value);
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            handleSort(this.value);
        });
    }
});