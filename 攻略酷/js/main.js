document.addEventListener('DOMContentLoaded', function() {
    // 導航欄滾動效果
    const navbar = document.querySelector('.navbar');
    
    // 初始化登入狀態
    if (typeof SessionManager !== 'undefined') {
        SessionManager.updateUIForAuthState(SessionManager.isLoggedIn());
    }
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.backgroundColor = 'rgba(30, 58, 138, 0.95)';
        } else {
            navbar.style.padding = '15px 0';
            navbar.style.backgroundColor = 'rgba(30, 58, 138, 0.9)';
        }
    });
    
    // 移動端選單切換
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            // 創建移動端選單
            if (!document.querySelector('.mobile-menu')) {
                const mobileMenu = document.createElement('div');
                mobileMenu.className = 'mobile-menu';
                
                // 複製導航連結
                const navLinksClone = navLinks.cloneNode(true);
                mobileMenu.appendChild(navLinksClone);
                
                // 複製認證按鈕
                const authButtonsClone = authButtons.cloneNode(true);
                mobileMenu.appendChild(authButtonsClone);
                
                // 添加到導航欄
                navbar.appendChild(mobileMenu);
                
                // 添加關閉按鈕
                const closeBtn = document.createElement('div');
                closeBtn.className = 'close-btn';
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                mobileMenu.appendChild(closeBtn);
                
                // 關閉按鈕事件
                closeBtn.addEventListener('click', function() {
                    mobileMenu.classList.remove('active');
                    setTimeout(() => {
                        mobileMenu.remove();
                    }, 300);
                });
                
                // 顯示選單
                setTimeout(() => {
                    mobileMenu.classList.add('active');
                }, 10);
            }
        });
    }
    
    // 卡片動畫效果
    const guideCards = document.querySelectorAll('.guide-card');
    const authorCards = document.querySelectorAll('.author-card');
    
    // 添加淡入動畫
    function fadeInElements() {
        const elements = document.querySelectorAll('.fade-in');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.classList.add('visible');
            }
        });
    }
    
    // 初始化需要淡入的元素
    function initFadeElements() {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.classList.add('fade-in');
        });
        
        guideCards.forEach(card => {
            card.classList.add('fade-in');
        });
        
        authorCards.forEach(card => {
            card.classList.add('fade-in');
        });
        
        // 初次執行
        fadeInElements();
    }
    
    // 滾動時檢查元素
    window.addEventListener('scroll', fadeInElements);
    
    // 初始化
    initFadeElements();
    
    // Hero 區域文字動畫
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroButtons = document.querySelector('.hero-buttons');
    const heroImage = document.querySelector('.hero-image');
    
    if (heroTitle && heroSubtitle && heroButtons && heroImage) {
        setTimeout(() => {
            heroTitle.classList.add('animate');
        }, 300);
        
        setTimeout(() => {
            heroSubtitle.classList.add('animate');
        }, 600);
        
        setTimeout(() => {
            heroButtons.classList.add('animate');
        }, 900);
        
        setTimeout(() => {
            heroImage.classList.add('animate');
        }, 1200);
    }
});