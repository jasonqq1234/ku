// admin.js - 帳號管理頁面功能

document.addEventListener('DOMContentLoaded', () => {
    // 檢查是否已登入，未登入則重定向到登入頁面
    if (!SessionManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // 檢查是否為管理員帳號
    const currentUser = SessionManager.getCurrentUser();
    console.log("當前用戶:", currentUser); // 調試信息
    if (!currentUser || currentUser.email !== 'guguchen8698@gmail.com') {
        alert('您沒有管理員權限，無法訪問此頁面');
        window.location.href = 'index.html';
        return;
    }

    // 初始化文章管理功能
    initArticleManagement();

    // 獲取DOM元素
    const userTableBody = document.getElementById('userTableBody');
    const contactTableBody = document.getElementById('contactTableBody');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const addUserBtn = document.getElementById('addUserBtn');
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const userForm = document.getElementById('userForm');
    const modalTitle = document.getElementById('modalTitle');
    const userId = document.getElementById('userId');
    const editUsername = document.getElementById('editUsername');
    const editEmail = document.getElementById('editEmail');
    const editPassword = document.getElementById('editPassword');
    const cancelBtn = document.getElementById('cancelBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const closeBtns = document.querySelectorAll('.close-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // 當前用戶列表
    let users = [];
    // 當前選中的用戶ID (用於刪除操作)
    let selectedUserId = null;
    // 聯絡訊息列表
    let contactMessages = [];

    // 加載用戶列表
    function loadUsers() {
        users = UserStorage.getUsers();
        renderUserTable(users);
    }

    // 渲染用戶表格
    function renderUserTable(usersToRender) {
        userTableBody.innerHTML = '';
        
        if (usersToRender.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="4" style="text-align: center;">沒有找到用戶</td>';
            userTableBody.appendChild(emptyRow);
            return;
        }

        usersToRender.forEach(user => {
            const row = document.createElement('tr');
            
            // 格式化日期
            const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '未知';
            
            row.innerHTML = `
                <td>${user.username || '未設置'}</td>
                <td>${user.email}</td>
                <td>${createdDate}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${user.email}">編輯</button>
                    <button class="delete-btn" data-id="${user.email}">刪除</button>
                </td>
            `;
            
            userTableBody.appendChild(row);
        });

        // 添加編輯按鈕事件
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const email = btn.getAttribute('data-id');
                openEditModal(email);
            });
        });

        // 添加刪除按鈕事件
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const email = btn.getAttribute('data-id');
                openDeleteModal(email);
            });
        });
    }

    // 打開編輯模態框
    function openEditModal(email) {
        const user = UserStorage.findUserByEmail(email);
        if (!user) return;

        modalTitle.textContent = '編輯用戶';
        userId.value = user.email;
        editUsername.value = user.username || '';
        editEmail.value = user.email;
        editPassword.value = '';

        editModal.style.display = 'block';
    }

    // 打開新增用戶模態框
    function openAddModal() {
        modalTitle.textContent = '新增用戶';
        userId.value = '';
        editUsername.value = '';
        editEmail.value = '';
        editPassword.value = '';

        editModal.style.display = 'block';
    }

    // 打開刪除確認模態框
    function openDeleteModal(email) {
        selectedUserId = email;
        deleteModal.style.display = 'block';
    }

    // 關閉模態框
    function closeModals() {
        editModal.style.display = 'none';
        deleteModal.style.display = 'none';
    }

    // 保存用戶
    function saveUser(e) {
        e.preventDefault();
        
        const isNewUser = !userId.value;
        const email = editEmail.value;
        const username = editUsername.value;
        const password = editPassword.value;

        // 檢查電子郵件是否已存在 (僅針對新用戶)
        if (isNewUser && UserStorage.findUserByEmail(email)) {
            alert('此電子郵件已被註冊，請使用其他電子郵件。');
            return;
        }

        // 獲取現有用戶數據或創建新用戶
        let userData = isNewUser ? {} : UserStorage.findUserByEmail(userId.value);
        
        // 更新用戶數據
        userData = {
            ...userData,
            username,
            email,
            createdAt: userData.createdAt || new Date().toISOString()
        };

        // 如果提供了新密碼，則更新密碼
        if (password) {
            userData.password = password;
        }

        // 保存用戶
        UserStorage.saveUser(userData);
        
        // 關閉模態框並重新加載用戶列表
        closeModals();
        loadUsers();
    }

    // 刪除用戶
    function deleteUser() {
        if (!selectedUserId) return;

        // 獲取所有用戶
        let users = UserStorage.getUsers();
        
        // 過濾掉要刪除的用戶
        users = users.filter(user => user.email !== selectedUserId);
        
        // 保存更新後的用戶列表
        localStorage.setItem('users', JSON.stringify(users));
        
        // 關閉模態框並重新加載用戶列表
        closeModals();
        loadUsers();
    }

    // 搜索用戶
    function searchUsers() {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (!searchTerm) {
            renderUserTable(users);
            return;
        }
        
        const filteredUsers = users.filter(user => 
            (user.username && user.username.toLowerCase().includes(searchTerm)) || 
            user.email.toLowerCase().includes(searchTerm)
        );
        
        renderUserTable(filteredUsers);
    }

    // 初始化頁面
    function init() {
        loadUsers();
        loadContactMessages();
        setupTabSwitching();
    }

    // 加載聯絡訊息
    function loadContactMessages() {
        contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        renderContactTable(contactMessages);
    }

    // 渲染聯絡訊息表格
    function renderContactTable(messages) {
        contactTableBody.innerHTML = '';
        
        if (messages.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">目前沒有聯絡訊息</td>`;
            contactTableBody.appendChild(emptyRow);
            return;
        }
        
        messages.forEach((message, index) => {
            const row = document.createElement('tr');
            
            // 格式化日期
            const date = new Date(message.timestamp);
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            row.innerHTML = `
                <td>${message.name}</td>
                <td>${message.email}</td>
                <td>${message.subject}</td>
                <td class="message-content">${message.message}</td>
                <td>${formattedDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" data-index="${index}">查看</button>
                        <button class="delete-btn" data-index="${index}">刪除</button>
                    </div>
                </td>
            `;
            contactTableBody.appendChild(row);
        });
        
        // 添加查看和刪除按鈕的事件監聽器
        const viewBtns = contactTableBody.querySelectorAll('.view-btn');
        const deleteBtns = contactTableBody.querySelectorAll('.delete-btn');
        
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                showContactDetail(contactMessages[index]);
            });
        });
        
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                deleteContactMessage(index);
            });
        });
    }
    
    // 顯示聯絡訊息詳情
    function showContactDetail(message) {
        // 創建模態框
        const modal = document.createElement('div');
        modal.className = 'modal contact-detail-modal';
        
        // 格式化日期
        const date = new Date(message.timestamp);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h2>聯絡訊息詳情</h2>
                <div class="contact-detail">
                    <p><strong>姓名：</strong> ${message.name}</p>
                    <p><strong>電子郵件：</strong> ${message.email}</p>
                    <p><strong>主旨：</strong> ${message.subject}</p>
                    <p><strong>提交時間：</strong> ${formattedDate}</p>
                    <p><strong>訊息內容：</strong></p>
                    <div class="message-full-content">
                        ${message.message.replace(/\n/g, '<br>')}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary close-detail-btn">關閉</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 添加關閉按鈕事件
        const closeBtn = modal.querySelector('.close-btn');
        const closeDetailBtn = modal.querySelector('.close-detail-btn');
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        closeDetailBtn.addEventListener('click', () => {
            modal.remove();
        });
    }
    
    // 刪除聯絡訊息
    function deleteContactMessage(index) {
        if (confirm('確定要刪除這條訊息嗎？')) {
            contactMessages.splice(index, 1);
            localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
            renderContactTable(contactMessages);
        }
    }
    
    // 設置頁籤切換
    function setupTabSwitching() {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除所有頁籤的active類
                tabBtns.forEach(b => b.classList.remove('active'));
                // 添加當前頁籤的active類
                btn.classList.add('active');
                
                // 隱藏所有內容區塊
                tabContents.forEach(content => content.classList.remove('active'));
                // 顯示對應的內容區塊
                const tabId = btn.dataset.tab;
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }

    // 事件監聽器
    addUserBtn.addEventListener('click', openAddModal);
    searchBtn.addEventListener('click', searchUsers);
    searchInput.addEventListener('keyup', e => {
        if (e.key === 'Enter') searchUsers();
    });
    userForm.addEventListener('submit', saveUser);
    cancelBtn.addEventListener('click', closeModals);
    cancelDeleteBtn.addEventListener('click', closeModals);
    confirmDeleteBtn.addEventListener('click', deleteUser);
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // 初始化頁面
    init();
});

// 文章管理功能
function initArticleManagement() {
    // 獲取DOM元素
    const articleTableBody = document.getElementById('articleTableBody');
    const uploadArticleBtn = document.getElementById('uploadArticleBtn');
    const uploadModal = document.getElementById('uploadModal');
    const uploadForm = document.getElementById('uploadForm');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const articleSearchInput = document.getElementById('articleSearchInput');
    const articleSearchBtn = document.getElementById('articleSearchBtn');
    const articleStatusSelect = document.getElementById('articleStatus');

    // 文章列表
    let articles = [];

    // 加載文章列表
    loadArticles();

    // 上傳攻略按鈕點擊事件
    uploadArticleBtn.addEventListener('click', () => {
        uploadModal.style.display = 'block';
    });

    // 取消上傳按鈕點擊事件
    cancelUploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
        uploadForm.reset();
    });

    // 關閉上傳模態框
    document.querySelectorAll('#uploadModal .close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            uploadModal.style.display = 'none';
            uploadForm.reset();
        });
    });

    // 上傳表單提交事件
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 獲取表單數據
        const title = document.getElementById('articleTitle').value;
        const author = document.getElementById('articleAuthor').value;
        const content = document.getElementById('articleContent').value;
        const imageFile = document.getElementById('articleImage').files[0];
        const articleFile = document.getElementById('articleFile').files[0];
        
        // 創建新文章對象
        const newArticle = {
            id: Date.now().toString(),
            title: title,
            author: author,
            content: content,
            createdAt: new Date().toISOString(),
            status: '已發布', // 後台上傳的攻略直接設為已發布
            imagePath: imageFile ? `uploads/${imageFile.name}` : 'images/guide-1.jpg',
            filePath: articleFile ? `uploads/${articleFile.name}` : ''
        };
        
        // 保存文章數據
        saveArticle(newArticle);
        
        // 關閉模態框並重置表單
        uploadModal.style.display = 'none';
        uploadForm.reset();
        
        // 重新加載文章列表
        loadArticles();
        
        // 顯示成功訊息
        alert('攻略已直接發布！');
    });

    // 搜尋文章
    articleSearchBtn.addEventListener('click', () => {
        const searchTerm = articleSearchInput.value.toLowerCase();
        const filteredArticles = articles.filter(article => 
            article.title.toLowerCase().includes(searchTerm) || 
            article.author.toLowerCase().includes(searchTerm)
        );
        renderArticleTable(filteredArticles);
    });

    // 加載文章列表
    function loadArticles() {
        // 從本地存儲獲取文章數據
        const storedArticles = localStorage.getItem('articles');
        articles = storedArticles ? JSON.parse(storedArticles) : [];
        renderArticleTable(articles);
    }

    // 保存文章
    function saveArticle(article) {
        articles.push(article);
        localStorage.setItem('articles', JSON.stringify(articles));
    }

    // 渲染文章表格
    function renderArticleTable(articlesToRender) {
        articleTableBody.innerHTML = '';
        
        if (articlesToRender.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="5" style="text-align: center;">沒有找到文章</td>';
            articleTableBody.appendChild(emptyRow);
            return;
        }

        articlesToRender.forEach(article => {
            const row = document.createElement('tr');
            
            // 格式化日期
            const createdDate = article.createdAt ? new Date(article.createdAt).toLocaleDateString() : '未知';
            
            // 根據狀態設置不同的樣式
            let statusClass = '';
            if (article.status === '待審核') {
                statusClass = 'status-pending';
            } else if (article.status === '已發布') {
                statusClass = 'status-published';
            } else if (article.status === '已拒絕') {
                statusClass = 'status-rejected';
            }
            
            row.innerHTML = `
                <td>${article.title}</td>
                <td>${article.author}</td>
                <td>${createdDate}</td>
                <td class="${statusClass}">${article.status || '待審核'}</td>
                <td class="action-buttons">
                    <button class="view-btn" data-id="${article.id}">查看</button>
                    ${article.status === '待審核' ? 
                        `<button class="approve-btn" data-id="${article.id}">通過</button>
                         <button class="reject-btn" data-id="${article.id}">拒絕</button>` : 
                        `<button class="edit-btn" data-id="${article.id}">編輯</button>`
                    }
                    <button class="delete-btn" data-id="${article.id}">刪除</button>
                </td>
            `;
            
            articleTableBody.appendChild(row);
        });

        // 添加查看按鈕事件
        document.querySelectorAll('#articleTableBody .view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const article = articles.find(a => a.id === id);
                if (article) {
                    showArticleDetail(article);
                }
            });
        });

        // 添加通過審核按鈕事件
        document.querySelectorAll('#articleTableBody .approve-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                approveArticle(id);
            });
        });

        // 添加拒絕審核按鈕事件
        document.querySelectorAll('#articleTableBody .reject-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                rejectArticle(id);
            });
        });

        // 添加編輯按鈕事件
        document.querySelectorAll('#articleTableBody .edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const article = articles.find(a => a.id === id);
                if (article) {
                    // 這裡可以實現編輯功能
                    alert('編輯功能待實現');
                }
            });
        });

        // 添加刪除按鈕事件
        document.querySelectorAll('#articleTableBody .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm('確定要刪除這篇文章嗎？')) {
                    deleteArticle(id);
                }
            });
        });
    }
    
    // 顯示文章詳情
    function showArticleDetail(article) {
        // 創建模態框
        const modal = document.createElement('div');
        modal.className = 'modal article-detail-modal';
        
        // 格式化日期
        const date = new Date(article.createdAt);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        modal.innerHTML = `
            <div class="modal-content article-modal-content">
                <div class="modal-header">
                    <h2>文章詳情</h2>
                    <span class="close-btn">&times;</span>
                </div>
                
                <div class="modal-body">
                    <div class="article-info">
                        <div class="article-meta">
                            <div class="meta-item">
                                <i class="fas fa-heading"></i>
                                <span><strong>標題：</strong> ${article.title}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-user"></i>
                                <span><strong>作者：</strong> ${article.author}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span><strong>發布日期：</strong> ${formattedDate}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-info-circle"></i>
                                <span><strong>狀態：</strong> <span class="status-badge status-${article.status || '待審核'}">${article.status || '待審核'}</span></span>
                            </div>
                        </div>
                        
                        <div class="article-content-container">
                            <h3>文章內容</h3>
                            <div class="article-full-content">
                                ${article.content}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 留言管理區塊 -->
                    <div class="comments-management">
                        <h3>留言管理 <span class="comment-count" id="comment-count-${article.id}">0</span></h3>
                        <div class="comments-list" id="comments-list-${article.id}">
                            <!-- 留言將在這裡動態加載 -->
                            <div class="no-comments">目前沒有留言</div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary close-detail-btn">關閉</button>
                    ${article.status === '待審核' ? 
                        `<button class="btn btn-success approve-detail-btn" data-id="${article.id}">通過審核</button>
                         <button class="btn btn-danger reject-detail-btn" data-id="${article.id}">拒絕發布</button>` : 
                        ''
                    }
                    <button class="btn btn-danger delete-article-btn" data-id="${article.id}">刪除文章</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 加載文章的留言
        loadArticleComments(article.id, `comments-list-${article.id}`, `comment-count-${article.id}`);
        
        // 函數：加載文章留言
        function loadArticleComments(articleId, commentsListId, commentCountId) {
            // 從本地存儲獲取留言
            const allComments = JSON.parse(localStorage.getItem('comments')) || [];
            const articleComments = allComments.filter(comment => comment.articleId === articleId);
            
            const commentsList = document.getElementById(commentsListId);
            const commentCount = document.getElementById(commentCountId);
            
            // 更新留言數量
            commentCount.textContent = articleComments.length;
            
            // 清空留言列表
            commentsList.innerHTML = '';
            
            if (articleComments.length === 0) {
                commentsList.innerHTML = '<div class="no-comments">目前沒有留言</div>';
                return;
            }
            
            // 渲染留言
            articleComments.forEach(comment => {
                const commentDate = new Date(comment.timestamp).toLocaleString();
                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item';
                commentElement.innerHTML = `
                    <div class="comment-header">
                        <span class="comment-author">${comment.username || '匿名用戶'}</span>
                        <span class="comment-date">${commentDate}</span>
                    </div>
                    <div class="comment-content">${comment.content}</div>
                    <div class="comment-actions">
                        <button class="delete-comment-btn" data-id="${comment.id}">刪除</button>
                    </div>
                `;
                commentsList.appendChild(commentElement);
                
                // 添加刪除留言按鈕事件
                const deleteBtn = commentElement.querySelector('.delete-comment-btn');
                deleteBtn.addEventListener('click', () => {
                    if (confirm('確定要刪除這條留言嗎？')) {
                        deleteComment(comment.id, articleId, commentsListId, commentCountId);
                    }
                });
            });
        }
        
        // 函數：刪除留言
        function deleteComment(commentId, articleId, commentsListId, commentCountId) {
            let allComments = JSON.parse(localStorage.getItem('comments')) || [];
            allComments = allComments.filter(comment => comment.id !== commentId);
            localStorage.setItem('comments', JSON.stringify(allComments));
            
            // 重新加載留言
            loadArticleComments(articleId, commentsListId, commentCountId);
        }
        
        // 添加關閉按鈕事件
        const closeBtn = modal.querySelector('.close-btn');
        const closeDetailBtn = modal.querySelector('.close-detail-btn');
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        closeDetailBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // 添加刪除文章按鈕事件
        const deleteArticleBtn = modal.querySelector('.delete-article-btn');
        if (deleteArticleBtn) {
            deleteArticleBtn.addEventListener('click', () => {
                if (confirm('確定要刪除這篇文章嗎？')) {
                    deleteArticle(article.id);
                    modal.remove();
                }
            });
        }
        
        // 添加通過審核按鈕事件
        const approveBtn = modal.querySelector('.approve-detail-btn');
        if (approveBtn) {
            approveBtn.addEventListener('click', () => {
                approveArticle(article.id);
                modal.remove();
            });
        }
        
        // 添加拒絕發布按鈕事件
        const rejectBtn = modal.querySelector('.reject-detail-btn');
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => {
                rejectArticle(article.id);
                modal.remove();
            });
        }
    }
    
    // 通過文章審核
    function approveArticle(id) {
        const article = articles.find(a => a.id === id);
        if (article) {
            if (confirm(`確定要通過「${article.title}」的審核嗎？`)) {
                article.status = '已發布';
                localStorage.setItem('articles', JSON.stringify(articles));
                renderArticleTable(articles);
                alert('文章已通過審核並發布！');
            }
        }
    }
    
    // 拒絕文章審核
    function rejectArticle(id) {
        const article = articles.find(a => a.id === id);
        if (article) {
            if (confirm(`確定要拒絕「${article.title}」的審核嗎？`)) {
                article.status = '已拒絕';
                localStorage.setItem('articles', JSON.stringify(articles));
                renderArticleTable(articles);
                alert('文章已被拒絕發布！');
            }
        }
    }

    // 刪除文章
    function deleteArticle(id) {
        articles = articles.filter(article => article.id !== id);
        localStorage.setItem('articles', JSON.stringify(articles));
        renderArticleTable(articles);
    }
}