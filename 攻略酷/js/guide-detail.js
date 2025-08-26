// 攻略詳情頁面功能
document.addEventListener('DOMContentLoaded', function() {
    // 獲取URL參數中的攻略ID
    const urlParams = new URLSearchParams(window.location.search);
    const guideId = urlParams.get('id');
    
    // 如果沒有ID參數，顯示錯誤訊息
    if (!guideId) {
        alert('找不到攻略資訊');
        window.location.href = 'explore.html';
        return;
    }
    
    // 從localStorage獲取攻略資料
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    const guide = articles.find(article => article.id === guideId);
    
    // 如果找不到對應的攻略，顯示錯誤訊息
    if (!guide) {
        alert('找不到此攻略資訊');
        window.location.href = 'explore.html';
        return;
    }
    
    // 更新頁面標題
    document.title = `${guide.title} - GuideTrade`;
    
    // 更新攻略內容
    document.getElementById('guide-title').textContent = guide.title;
    document.getElementById('guide-author').textContent = guide.author;
    document.getElementById('guide-content').innerHTML = guide.content;
    
    // 更新攻略日期
    const createdDate = guide.createdAt ? new Date(guide.createdAt) : new Date();
    const formattedDate = `${createdDate.getFullYear()}/${(createdDate.getMonth() + 1).toString().padStart(2, '0')}/${createdDate.getDate().toString().padStart(2, '0')} 發布`;
    document.getElementById('guide-date').textContent = formattedDate;
    
    // 更新價格顯示
    const priceElement = document.getElementById('guide-price');
    if (guide.price && parseFloat(guide.price) > 0) {
        priceElement.textContent = `NT$ ${guide.price}`;
    } else {
        priceElement.textContent = '免費';
    }
    
    // 更新攻略圖片
    if (guide.imagePath) {
        document.getElementById('guide-image').src = guide.imagePath;
    }
    
    // 如果有攻略檔案，顯示下載區塊
    if (guide.filePath) {
        const fileSection = document.getElementById('guide-file-section');
        const fileLink = document.getElementById('guide-file-link');
        
        fileSection.style.display = 'block';
        fileLink.href = guide.filePath;
        fileLink.download = guide.title + '.pdf';
    }
    
    // 處理購買按鈕
    const purchaseButton = document.getElementById('purchase-button');
    const purchaseSection = document.getElementById('guide-purchase-section');
    
    if (guide.price && parseFloat(guide.price) > 0) {
        purchaseButton.textContent = `購買此攻略 NT$ ${guide.price}`;
        purchaseButton.addEventListener('click', function() {
            handlePurchase(guide);
        });
    } else {
        // 如果是免費攻略，隱藏購買按鈕
        purchaseSection.style.display = 'none';
    }
    
    // 處理留言功能
    setupCommentSystem(guideId);
});

// 設置評論系統
function setupCommentSystem(guideId) {
    const commentForm = document.getElementById('comment-form');
    const loginRequiredMessage = document.getElementById('login-required-message');
    const commentsContainer = document.getElementById('comments-container');
    const noCommentsElement = document.getElementById('no-comments');
    
    // 檢查用戶是否已登入
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // 用戶已登入，顯示留言表單
        commentForm.style.display = 'block';
        loginRequiredMessage.style.display = 'none';
    } else {
        // 用戶未登入，顯示登入提示
        commentForm.style.display = 'none';
        loginRequiredMessage.style.display = 'block';
    }
    
    // 載入留言
    loadComments(guideId);
    
    // 處理留言提交
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const commentContent = document.getElementById('comment-content').value.trim();
        
        if (!commentContent) {
            alert('請輸入留言內容');
            return;
        }
        
        // 創建新留言
        const newComment = {
            id: Date.now().toString(),
            guideId: guideId,
            userId: currentUser.id,
            username: currentUser.username,
            content: commentContent,
            createdAt: new Date().toISOString()
        };
        
        // 保存留言
        saveComment(newComment);
        
        // 重置表單
        document.getElementById('comment-content').value = '';
        
        // 重新載入留言
        loadComments(guideId);
    });
}

// 保存留言
function saveComment(comment) {
    // 從localStorage獲取現有留言
    let comments = JSON.parse(localStorage.getItem('comments')) || [];
    
    // 添加新留言
    comments.push(comment);
    
    // 保存回localStorage
    localStorage.setItem('comments', JSON.stringify(comments));
}

// 載入留言
function loadComments(guideId) {
    const commentsContainer = document.getElementById('comments-container');
    const noCommentsElement = document.getElementById('no-comments');
    
    // 從localStorage獲取留言
    const comments = JSON.parse(localStorage.getItem('comments')) || [];
    
    // 篩選出當前攻略的留言
    const guideComments = comments.filter(comment => comment.guideId === guideId);
    
    // 清空留言容器，但保留no-comments元素
    while (commentsContainer.firstChild) {
        if (commentsContainer.firstChild.id === 'no-comments') {
            break;
        }
        commentsContainer.removeChild(commentsContainer.firstChild);
    }
    
    // 如果沒有留言，顯示提示訊息
    if (guideComments.length === 0) {
        if (noCommentsElement) {
            noCommentsElement.style.display = 'block';
        } else {
            commentsContainer.innerHTML = '<p id="no-comments" class="no-comments">目前還沒有留言，成為第一個留言的人吧！</p>';
        }
        return;
    } else {
        if (noCommentsElement) {
            noCommentsElement.style.display = 'none';
        }
    }
    
    // 按時間排序留言（最新的在前面）
    guideComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 渲染留言
    guideComments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsContainer.insertBefore(commentElement, noCommentsElement);
    });
}

// 創建留言元素
function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    
    // 格式化日期
    const commentDate = new Date(comment.createdAt);
    const formattedDate = `${commentDate.getFullYear()}/${(commentDate.getMonth() + 1).toString().padStart(2, '0')}/${commentDate.getDate().toString().padStart(2, '0')} ${commentDate.getHours().toString().padStart(2, '0')}:${commentDate.getMinutes().toString().padStart(2, '0')}`;
    
    commentDiv.innerHTML = `
        <div class="comment-header">
            <span class="comment-author">${comment.username}</span>
            <span class="comment-date">${formattedDate}</span>
        </div>
        <div class="comment-content">${comment.content}</div>
    `;
    
    return commentDiv;
}