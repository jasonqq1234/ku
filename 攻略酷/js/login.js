// login.js - 登入頁面功能

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.display = 'none';
    errorMessage.style.color = 'red';
    errorMessage.style.marginBottom = '15px';
    
    // 在表單前插入錯誤訊息元素
    loginForm.insertBefore(errorMessage, loginForm.firstChild);
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 獲取表單數據
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // 驗證登入
        const user = UserStorage.validateLogin(email, password);
        
        if (user) {
            // 登入成功
            errorMessage.style.display = 'none';
            
            // 設置當前用戶
            SessionManager.setCurrentUser(user);
            
            // 如果選擇"記住我"，可以設置更長的過期時間
            if (rememberMe) {
                // 這裡可以實現記住登入狀態的邏輯
                // 例如設置cookie或其他持久化存儲
            }
            
            // 設置登入成功標誌，防止頁面閃爍
            sessionStorage.setItem('loginSuccess', 'true');
            
            // 顯示成功訊息
            alert('登入成功！');
            
            // 使用延遲重定向，確保UI更新完成
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 100);
        } else {
            // 登入失敗
            errorMessage.textContent = '電子郵件或密碼不正確，請重試。';
            errorMessage.style.display = 'block';
        }
    });
    
    // 社交登入按鈕
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('社交媒體登入功能即將推出！');
        });
    });
    
    // 如果用戶已登入，重定向到首頁
    if (SessionManager.isLoggedIn()) {
        window.location.href = 'index.html';
    }
});