// auth.js - 用戶認證相關功能

// 用戶資料存儲
const UserStorage = {
    // 獲取所有用戶
    getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    },
    
    // 保存用戶
    saveUser(user) {
        const users = this.getUsers();
        // 檢查是否已存在相同電子郵件
        const existingUserIndex = users.findIndex(u => u.email === user.email);
        
        if (existingUserIndex >= 0) {
            // 更新現有用戶
            users[existingUserIndex] = { ...users[existingUserIndex], ...user };
        } else {
            // 添加新用戶
            users.push(user);
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    },
    
    // 根據電子郵件查找用戶
    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email);
    },
    
    // 驗證用戶登入
    validateLogin(email, password) {
        const user = this.findUserByEmail(email);
        if (!user) return null;
        
        // 簡單密碼驗證 (實際應用中應使用更安全的方法)
        if (user.password === password) {
            return user;
        }
        
        return null;
    }
};

// 會話管理
const SessionManager = {
    // 設置當前登入用戶
    setCurrentUser(user) {
        // 移除敏感信息
        const sessionUser = { ...user };
        delete sessionUser.password;
        
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));
        this.updateUIForAuthState(true);
    },
    
    // 獲取當前登入用戶
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },
    
    // 檢查用戶是否已登入
    isLoggedIn() {
        return !!this.getCurrentUser();
    },
    
    // 登出
    logout() {
        localStorage.removeItem('currentUser');
        this.updateUIForAuthState(false);
        // 重定向到首頁
        window.location.href = 'index.html';
    },
    
    // 根據登入狀態更新UI
    updateUIForAuthState(isLoggedIn) {
        const navButtons = document.querySelector('.auth-buttons, .nav-buttons');
        if (!navButtons) return;
        
        if (isLoggedIn) {
            const currentUser = this.getCurrentUser();
            navButtons.innerHTML = `
                <div class="user-menu">
                    <span class="username btn btn-outline">${currentUser.username}</span>
                    <a href="#" id="logoutBtn" class="btn btn-outline">登出</a>
                </div>
            `;
            
            // 添加登出按鈕事件
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
            
            // 添加用戶選單樣式
            const style = document.createElement('style');
            style.textContent = `
                .user-menu {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .username {
                    font-weight: bold;
                    padding: 8px 16px;
                    border-radius: 4px;
                    color: white;
                }
                .btn-outline {
                    border: 1px solid white;
                    color: white;
                }
                .btn-outline:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
            `;
            document.head.appendChild(style);
        } else {
            navButtons.innerHTML = `
                <a href="login.html" class="btn btn-outline">登入</a>
                <a href="signup.html" class="btn btn-primary">註冊</a>
            `;
        }
    }
};

// 密碼強度檢查
const PasswordStrength = {
    check(password) {
        let strength = 0;
        
        // 長度檢查
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        
        // 複雜度檢查
        if (/[A-Z]/.test(password)) strength += 1; // 大寫字母
        if (/[a-z]/.test(password)) strength += 1; // 小寫字母
        if (/[0-9]/.test(password)) strength += 1; // 數字
        if (/[^A-Za-z0-9]/.test(password)) strength += 1; // 特殊字符
        
        // 返回強度級別和描述
        if (strength < 3) {
            return { level: 1, text: '弱' };
        } else if (strength < 5) {
            return { level: 2, text: '中' };
        } else {
            return { level: 3, text: '強' };
        }
    },
    
    // 更新密碼強度UI
    updateUI(password, strengthMeter, strengthText) {
        const result = this.check(password);
        
        // 更新強度條
        const percentage = (result.level / 3) * 100;
        strengthMeter.style.width = `${percentage}%`;
        
        // 更新顏色
        strengthMeter.className = 'strength-bar';
        if (result.level === 1) {
            strengthMeter.classList.add('weak');
        } else if (result.level === 2) {
            strengthMeter.classList.add('medium');
        } else {
            strengthMeter.classList.add('strong');
        }
        
        // 更新文字
        strengthText.textContent = `密碼強度: ${result.text}`;
    }
};

// 頁面加載時檢查登入狀態
document.addEventListener('DOMContentLoaded', () => {
    SessionManager.updateUIForAuthState(SessionManager.isLoggedIn());
    
    // 密碼顯示切換
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
});

// 導出模組
window.UserStorage = UserStorage;
window.SessionManager = SessionManager;
window.PasswordStrength = PasswordStrength;