document.addEventListener('DOMContentLoaded', function() {
    // 檢查用戶是否已登入
    if (!SessionManager.isLoggedIn()) {
        // 如果未登入，顯示登入提示並隱藏發表表單
        const publishFormSection = document.querySelector('.publish-form-section');
        if (publishFormSection) {
            publishFormSection.innerHTML = `
                <div class="container">
                    <div class="login-required-message">
                        <i class="fas fa-lock"></i>
                        <h2>請先登入</h2>
                        <p>您需要登入才能發表攻略</p>
                        <div class="login-buttons">
                            <a href="login.html" class="btn btn-primary">登入</a>
                            <a href="signup.html" class="btn btn-outline">註冊</a>
                        </div>
                    </div>
                </div>
            `;
            // 添加樣式
            const style = document.createElement('style');
            style.textContent = `
                .login-required-message {
                    text-align: center;
                    padding: 50px 20px;
                    background-color: #fff;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    max-width: 500px;
                    margin: 0 auto;
                }
                .login-required-message i {
                    font-size: 48px;
                    color: #6c5ce7;
                    margin-bottom: 20px;
                }
                .login-required-message h2 {
                    margin-bottom: 10px;
                    color: #333;
                }
                .login-required-message p {
                    margin-bottom: 30px;
                    color: #666;
                }
                .login-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                }
            `;
            document.head.appendChild(style);
            return; // 終止後續代碼執行
        }
    }

    // 步驟導航功能
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-line');
    let currentStep = 0;

    // 下一步按鈕點擊事件
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 這裡可以添加表單驗證邏輯
            if (validateStep(currentStep)) {
                steps[currentStep].style.display = 'none';
                currentStep++;
                steps[currentStep].style.display = 'block';
                updateProgress();
            }
        });
    });

    // 上一步按鈕點擊事件
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            steps[currentStep].style.display = 'none';
            currentStep--;
            steps[currentStep].style.display = 'block';
            updateProgress();
        });
    });

    // 更新進度條
    function updateProgress() {
        progressSteps.forEach((step, index) => {
            if (index < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        progressLines.forEach((line, index) => {
            if (index < currentStep) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });
    }

    // 表單驗證
    function validateStep(step) {
        // 簡單驗證示例，實際應用中可以根據需求擴展
        if (step === 0) {
            const title = document.getElementById('guideTitle').value;
            const category = document.getElementById('guideCategory').value;
            const brief = document.getElementById('guideBrief').value;
            
            if (!title || !category || !brief) {
                alert('請填寫所有必填欄位');
                return false;
            }
        }
        return true;
    }

    // 標籤輸入處理
    const tagsInput = document.getElementById('guideTags');
    const tagsPreview = document.querySelector('.tags-preview');
    
    tagsInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tagText = this.value.trim();
            if (tagText) {
                addTag(tagText);
                this.value = '';
            }
        }
    });

    tagsInput.addEventListener('blur', function() {
        const tagText = this.value.trim();
        if (tagText) {
            addTag(tagText);
            this.value = '';
        }
    });

    function addTag(text) {
        const tags = text.split(',').filter(tag => tag.trim() !== '');
        
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                ${tag.trim()}
                <span class="remove-tag"><i class="fas fa-times"></i></span>
            `;
            
            const removeBtn = tagElement.querySelector('.remove-tag');
            removeBtn.addEventListener('click', function() {
                tagElement.remove();
            });
            
            tagsPreview.appendChild(tagElement);
        });
    }

    // 圖片上傳預覽
    const coverImageInput = document.getElementById('guideCoverImage');
    const imagePreview = document.querySelector('.image-preview');
    const uploadBtn = document.querySelector('.upload-btn');
    
    uploadBtn.addEventListener('click', function() {
        coverImageInput.click();
    });
    
    coverImageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Cover Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // 字數計數器
    const briefTextarea = document.getElementById('guideBrief');
    const briefCounter = document.getElementById('briefCounter');
    
    briefTextarea.addEventListener('input', function() {
        const count = this.value.length;
        briefCounter.textContent = count;
        
        if (count > 180) {
            briefCounter.style.color = 'orange';
        } else if (count > 200) {
            briefCounter.style.color = 'red';
        } else {
            briefCounter.style.color = '';
        }
    });

    // 編輯器工具欄功能
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    const contentEditor = document.getElementById('guideContent');
    
    toolbarButtons.forEach(button => {
        button.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            
            switch(format) {
                case 'bold':
                    document.execCommand('bold', false, null);
                    break;
                case 'italic':
                    document.execCommand('italic', false, null);
                    break;
                case 'underline':
                    document.execCommand('underline', false, null);
                    break;
                case 'heading':
                    document.execCommand('formatBlock', false, '<h2>');
                    break;
                case 'list-ul':
                    document.execCommand('insertUnorderedList', false, null);
                    break;
                case 'list-ol':
                    document.execCommand('insertOrderedList', false, null);
                    break;
                case 'image':
                    const imageUrl = prompt('請輸入圖片URL:');
                    if (imageUrl) {
                        document.execCommand('insertImage', false, imageUrl);
                    }
                    break;
                case 'link':
                    const linkUrl = prompt('請輸入連結URL:');
                    if (linkUrl) {
                        document.execCommand('createLink', false, linkUrl);
                    }
                    break;
            }
            
            // 切換按鈕活動狀態
            this.classList.toggle('active');
            setTimeout(() => {
                this.classList.remove('active');
            }, 300);
            
            // 保持編輯器焦點
            contentEditor.focus();
        });
    });

    // 章節管理
    const addChapterBtn = document.querySelector('.add-chapter-btn');
    const chaptersContainer = document.querySelector('.chapters-container');
    
    addChapterBtn.addEventListener('click', function() {
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item';
        chapterItem.innerHTML = `
            <input type="text" placeholder="章節標題" class="chapter-title">
            <div class="chapter-actions">
                <button type="button" class="btn-icon move-up"><i class="fas fa-arrow-up"></i></button>
                <button type="button" class="btn-icon move-down"><i class="fas fa-arrow-down"></i></button>
                <button type="button" class="btn-icon delete-chapter"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        chaptersContainer.appendChild(chapterItem);
        
        // 綁定章節操作按鈕事件
        bindChapterEvents(chapterItem);
    });
    
    // 綁定已有章節的事件
    document.querySelectorAll('.chapter-item').forEach(item => {
        bindChapterEvents(item);
    });
    
    function bindChapterEvents(chapterItem) {
        const moveUpBtn = chapterItem.querySelector('.move-up');
        const moveDownBtn = chapterItem.querySelector('.move-down');
        const deleteBtn = chapterItem.querySelector('.delete-chapter');
        
        moveUpBtn.addEventListener('click', function() {
            const prev = chapterItem.previousElementSibling;
            if (prev) {
                chaptersContainer.insertBefore(chapterItem, prev);
            }
        });
        
        moveDownBtn.addEventListener('click', function() {
            const next = chapterItem.nextElementSibling;
            if (next) {
                chaptersContainer.insertBefore(next, chapterItem);
            }
        });
        
        deleteBtn.addEventListener('click', function() {
            if (confirm('確定要刪除此章節嗎？')) {
                chapterItem.remove();
            }
        });
    }

    // 預覽設定切換
    const previewCheckbox = document.getElementById('previewEnabled');
    const previewSettings = document.getElementById('previewSettings');
    
    previewCheckbox.addEventListener('change', function() {
        previewSettings.style.display = this.checked ? 'block' : 'none';
    });
    
    // 範圍滑塊值顯示
    const rangeSlider = document.getElementById('previewPercentage');
    const rangeValue = document.querySelector('.range-value');
    
    rangeSlider.addEventListener('input', function() {
        rangeValue.textContent = this.value + '%';
    });
    
    // 發布設定切換
    const publishTypeRadios = document.querySelectorAll('input[name="publishType"]');
    const scheduleSettings = document.getElementById('scheduleSettings');
    
    publishTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            scheduleSettings.style.display = this.value === 'scheduled' ? 'block' : 'none';
        });
    });
    
    // 表單提交
    const publishForm = document.getElementById('publishForm');
    let isSubmitting = false; // 防止重複提交的標記
    
    publishForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 防止重複提交
        if (isSubmitting) {
            return;
        }
        isSubmitting = true;
        
        // 驗證條款是否同意
        const termsAgreed = document.getElementById('termsAgreed').checked;
        if (!termsAgreed) {
            alert('請同意攻略發布條款和內容政策');
            isSubmitting = false;
            return;
        }
        
        // 收集表單數據
        const formData = {
            id: Date.now().toString(),
            title: document.getElementById('guideTitle').value,
            author: document.getElementById('guideAuthor').value,
            category: document.getElementById('guideCategory').value,
            brief: document.getElementById('guideBrief').value,
            content: document.getElementById('guideContent').innerHTML,
            price: document.getElementById('guidePrice').value,
            createdAt: new Date().toISOString(),
            status: '待審核', // 添加審核狀態
            tags: document.getElementById('guideTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        // 處理封面圖片
        const coverImageInput = document.getElementById('guideCoverImage');
        if (coverImageInput.files && coverImageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                formData.imagePath = e.target.result;
                saveArticle(formData);
            };
            reader.readAsDataURL(coverImageInput.files[0]);
        } else {
            // 沒有選擇封面圖片，使用預設圖片
            formData.imagePath = 'images/guide-1.jpg';
            saveArticle(formData);
        }
        
        // 處理攻略檔案
        const guideFileInput = document.getElementById('guideFile');
        if (guideFileInput.files && guideFileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                formData.filePath = e.target.result;
                formData.fileName = guideFileInput.files[0].name;
                saveArticle(formData);
            };
            reader.readAsDataURL(guideFileInput.files[0]);
        } else {
            saveArticle(formData);
        }
    });
    
    // 保存文章到 localStorage
    function saveArticle(formData) {
        // 檢查是否已經保存過，防止重複保存
        if (localStorage.getItem('tempArticleId') === formData.id) {
            return; // 如果已經保存過相同ID的文章，則不再保存
        }
        
        // 從 localStorage 獲取現有文章
        let articles = JSON.parse(localStorage.getItem('articles')) || [];
        
        // 添加新文章
        articles.push(formData);
        
        // 保存回 localStorage
        localStorage.setItem('articles', JSON.stringify(articles));
        
        // 記錄當前文章ID，防止重複保存
        localStorage.setItem('tempArticleId', formData.id);
        
        // 顯示成功訊息
        alert('攻略已提交，等待審核！審核通過後將會發布。');
        
        // 重置表單
        document.getElementById('publishForm').reset();
        document.querySelector('.image-preview').innerHTML = '';
        document.querySelector('.tags-preview').innerHTML = '';
        
        // 重置提交狀態
        isSubmitting = false;
        
        // 跳轉到探索頁面
        window.location.href = 'explore.html';
        
        // 清除臨時ID記錄（延遲執行，確保跳轉後清除）
        setTimeout(() => {
            localStorage.removeItem('tempArticleId');
        }, 2000);
    }
    
    // 儲存草稿按鈕
    const saveDraftBtn = document.querySelector('.save-draft');
    
    saveDraftBtn.addEventListener('click', function() {
        // 這裡可以添加儲存草稿邏輯
        alert('草稿已儲存');
    });
});