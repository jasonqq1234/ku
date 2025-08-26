document.addEventListener('DOMContentLoaded', function() {
    // 獲取表單元素
    const contactForm = document.querySelector('.contact-form');
    const formFields = contactForm.querySelectorAll('input, textarea');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    
    // 表單驗證函數
    function validateForm() {
        let isValid = true;
        
        formFields.forEach(field => {
            if (field.required && !field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
            
            // 電子郵件格式驗證
            if (field.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    isValid = false;
                    field.classList.add('error');
                }
            }
        });
        
        return isValid;
    }
    
    // 添加輸入事件監聽器，實時驗證
    formFields.forEach(field => {
        field.addEventListener('input', function() {
            if (field.classList.contains('error')) {
                if (field.value.trim()) {
                    field.classList.remove('error');
                }
                
                // 電子郵件格式驗證
                if (field.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailRegex.test(field.value)) {
                        field.classList.remove('error');
                    }
                }
            }
        });
    });
    
    // 表單提交處理
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 驗證表單
        if (!validateForm()) {
            showMessage('請填寫所有必填欄位並確保格式正確', 'error');
            return;
        }
        
        // 禁用提交按鈕，防止重複提交
        submitButton.disabled = true;
        submitButton.textContent = '發送中...';
        
        // 收集表單數據
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString()
        };
        
        // 模擬API請求
        setTimeout(() => {
            // 在實際應用中，這裡應該是一個fetch或AJAX請求
            console.log('提交的表單數據:', formData);
            
            // 儲存到localStorage (模擬數據庫存儲)
            saveContactMessage(formData);
            
            // 顯示成功訊息
            showSuccessMessage();
            
            // 重置表單
            contactForm.reset();
            
            // 恢復提交按鈕
            submitButton.disabled = false;
            submitButton.textContent = '發送訊息';
        }, 1500);
    });
    
    // 保存聯絡訊息到localStorage
    function saveContactMessage(message) {
        let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        messages.push(message);
        localStorage.setItem('contactMessages', JSON.stringify(messages));
    }
    
    // 顯示成功訊息
    function showSuccessMessage() {
        // 創建成功訊息元素
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h3>訊息已成功發送！</h3>
                <p>感謝您的來信，我們會盡快回覆您。</p>
                <button class="btn btn-primary close-btn">確定</button>
            </div>
        `;
        
        // 添加到頁面
        document.body.appendChild(successMessage);
        
        // 添加關閉按鈕事件
        const closeBtn = successMessage.querySelector('.close-btn');
        closeBtn.addEventListener('click', function() {
            successMessage.remove();
        });
        
        // 5秒後自動關閉
        setTimeout(() => {
            if (document.body.contains(successMessage)) {
                successMessage.remove();
            }
        }, 5000);
    }
    
    // 顯示訊息函數
    function showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        // 添加到表單上方
        contactForm.insertBefore(messageElement, contactForm.firstChild);
        
        // 3秒後自動移除
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
});