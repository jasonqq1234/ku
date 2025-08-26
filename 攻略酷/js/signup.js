// signup.js - 註冊頁面功能

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    // 創建錯誤訊息元素
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.display = 'none';
    errorMessage.style.color = 'red';
    errorMessage.style.marginBottom = '15px';
    
    // 在表單前插入錯誤訊息元素
    signupForm.insertBefore(errorMessage, signupForm.firstChild);
    
    // 密碼強度檢查
    passwordInput.addEventListener('input', () => {
        PasswordStrength.updateUI(passwordInput.value, strengthBar, strengthText);
    });
    
    // 表單提交
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 獲取表單數據
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // 驗證密碼匹配
        if (password !== confirmPassword) {
            errorMessage.textContent = '密碼不匹配，請重新輸入。';
            errorMessage.style.display = 'block';
            return;
        }
        
        // 檢查密碼強度
        const strengthResult = PasswordStrength.check(password);
        if (strengthResult.level < 2) {
            errorMessage.textContent = '密碼強度不足，請使用更強的密碼。';
            errorMessage.style.display = 'block';
            return;
        }
        
        // 檢查電子郵件是否已存在
        const existingUser = UserStorage.findUserByEmail(email);
        if (existingUser) {
            errorMessage.textContent = '此電子郵件已被註冊，請使用其他電子郵件。';
            errorMessage.style.display = 'block';
            return;
        }
        
        // 創建新用戶
        const newUser = {
            username,
            email,
            password,
            createdAt: new Date().toISOString(),
            avatar: 'images/avatar-1.svg' // 默認頭像
        };
        
        // 保存用戶
        UserStorage.saveUser(newUser);
        
        // 設置註冊成功標誌
        sessionStorage.setItem('signupSuccess', 'true');
        
        // 顯示成功訊息
        alert('註冊成功！請前往登入頁面登入您的帳號。');
        
        // 使用延遲重定向，跳轉到登入頁面
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 100);
    });
    
    // 社交註冊按鈕
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('社交媒體註冊功能即將推出！');
        });
    });
    
    // 如果用戶已登入，重定向到首頁
    if (SessionManager.isLoggedIn()) {
        window.location.href = 'index.html';
    }
});