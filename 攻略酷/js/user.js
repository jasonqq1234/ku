/**
 * GuideTrade 會員系統 JavaScript
 * 實現會員頁面的互動功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 用戶下拉選單功能
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
        userDropdown.addEventListener('click', function(e) {
            this.classList.toggle('active');
            e.stopPropagation();
        });
    }

    // 點擊頁面其他區域關閉下拉選單
    document.addEventListener('click', function() {
        if (userDropdown) {
            userDropdown.classList.remove('active');
        }
    });

    // 個人資料編輯功能
    const editProfileBtn = document.querySelector('.content-card .btn-outline');
    if (editProfileBtn && editProfileBtn.textContent.includes('編輯資料')) {
        const profileInputs = document.querySelectorAll('.profile-form input, .profile-form textarea');
        
        editProfileBtn.addEventListener('click', function() {
            if (this.textContent.includes('編輯資料')) {
                // 啟用編輯模式
                profileInputs.forEach(input => {
                    input.disabled = false;
                });
                this.textContent = '儲存變更';
                this.classList.add('btn-primary');
                this.classList.remove('btn-outline');
            } else {
                // 儲存變更
                profileInputs.forEach(input => {
                    input.disabled = true;
                });
                this.textContent = '編輯資料';
                this.classList.remove('btn-primary');
                this.classList.add('btn-outline');
                
                // 顯示儲存成功訊息
                showNotification('個人資料已成功更新！');
            }
        });
    }

    // 技能編輯功能
    const editSkillsBtn = document.querySelector('.content-card:nth-child(2) .btn-outline');
    if (editSkillsBtn) {
        editSkillsBtn.addEventListener('click', function() {
            if (this.textContent.includes('編輯技能')) {
                // 顯示技能編輯模式
                document.querySelectorAll('.skill-tag').forEach(tag => {
                    tag.classList.add('editable');
                    const deleteIcon = document.createElement('span');
                    deleteIcon.className = 'delete-tag';
                    deleteIcon.innerHTML = '&times;';
                    tag.appendChild(deleteIcon);
                });
                
                // 添加新增技能的輸入框
                document.querySelectorAll('.skill-category').forEach(category => {
                    const input = document.createElement('div');
                    input.className = 'add-skill-input';
                    input.innerHTML = `
                        <input type="text" placeholder="新增技能...">
                        <button class="add-skill-btn">+</button>
                    `;
                    category.appendChild(input);
                });
                
                this.textContent = '儲存技能';
                this.classList.add('btn-primary');
                this.classList.remove('btn-outline');
                
                // 綁定刪除技能標籤事件
                document.querySelectorAll('.delete-tag').forEach(deleteBtn => {
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        this.parentElement.remove();
                    });
                });
                
                // 綁定新增技能標籤事件
                document.querySelectorAll('.add-skill-btn').forEach(addBtn => {
                    addBtn.addEventListener('click', function() {
                        const input = this.previousElementSibling;
                        const skillText = input.value.trim();
                        
                        if (skillText) {
                            const skillTag = document.createElement('span');
                            skillTag.className = 'skill-tag editable';
                            skillTag.textContent = skillText;
                            
                            const deleteIcon = document.createElement('span');
                            deleteIcon.className = 'delete-tag';
                            deleteIcon.innerHTML = '&times;';
                            skillTag.appendChild(deleteIcon);
                            
                            const skillTags = this.closest('.skill-category').querySelector('.skill-tags');
                            skillTags.appendChild(skillTag);
                            
                            // 綁定新增的刪除按鈕事件
                            deleteIcon.addEventListener('click', function(e) {
                                e.stopPropagation();
                                this.parentElement.remove();
                            });
                            
                            input.value = '';
                        }
                    });
                });
                
            } else {
                // 儲存技能變更
                document.querySelectorAll('.delete-tag').forEach(deleteBtn => {
                    deleteBtn.remove();
                });
                
                document.querySelectorAll('.skill-tag').forEach(tag => {
                    tag.classList.remove('editable');
                });
                
                document.querySelectorAll('.add-skill-input').forEach(input => {
                    input.remove();
                });
                
                this.textContent = '編輯技能';
                this.classList.remove('btn-primary');
                this.classList.add('btn-outline');
                
                // 顯示儲存成功訊息
                showNotification('專長與技能已成功更新！');
            }
        });
    }

    // 顯示通知訊息
    function showNotification(message) {
        // 檢查是否已存在通知元素
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.classList.add('show');
        
        // 3秒後自動隱藏
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // 頁籤切換功能 (用於會員中心的不同頁面)
    const profileMenu = document.querySelectorAll('.profile-menu li a');
    if (profileMenu.length > 0) {
        profileMenu.forEach(item => {
            item.addEventListener('click', function(e) {
                // 如果是在同一頁面內的頁籤切換
                if (this.getAttribute('data-tab')) {
                    e.preventDefault();
                    
                    // 移除所有頁籤的活動狀態
                    profileMenu.forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // 設置當前頁籤為活動狀態
                    this.classList.add('active');
                    
                    // 顯示對應的內容區塊
                    const tabId = this.getAttribute('data-tab');
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    document.getElementById(tabId).classList.add('active');
                }
            });
        });
    }

    // 攻略卡片懸停效果
    const guideCards = document.querySelectorAll('.guide-card');
    if (guideCards.length > 0) {
        guideCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.classList.add('hover');
            });
            
            card.addEventListener('mouseleave', function() {
                this.classList.remove('hover');
            });
        });
    }

    // 收益圖表初始化 (如果存在)
    const earningsChart = document.getElementById('earningsChart');
    if (earningsChart) {
        // 這裡可以使用圖表庫如Chart.js來初始化圖表
        // 示例代碼，實際使用時需要引入Chart.js庫
        /*
        new Chart(earningsChart, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                datasets: [{
                    label: '月收益 (NT$)',
                    data: [1200, 1900, 3000, 5000, 4000, 6000],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        */
    }

    // 頭像上傳預覽功能
    const avatarUpload = document.getElementById('avatarUpload');
    const avatarPreview = document.querySelector('.avatar-image');
    
    if (avatarUpload && avatarPreview) {
        avatarUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                    showNotification('頭像已更新，請儲存變更');
                };
                reader.readAsDataURL(file);
            }
        });
    }
});