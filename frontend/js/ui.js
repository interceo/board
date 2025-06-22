// UI rendering functions
const ForumUI = {
    // Function to create a board card element
    createBoardCard: function(board) {
        const boardCard = document.createElement('div');
        boardCard.className = 'board-card';
        
        // Set content
        boardCard.innerHTML = `
            <h2>${escapeHtml(board.name || 'Unnamed Board')}</h2>
            <p>${escapeHtml(board.description || 'No description')}</p>
            <div class="board-stats">
                <span>${board.thread_count || 0} threads</span>
                <span>${board.post_count || 0} posts</span>
            </div>
            <a href="/${escapeHtml(board.name)}" class="view-board">View Board</a>
        `;
        
        return boardCard;
    },
    
    // Function to create a thread list item
    createThreadElement: function(thread, boardName) {
        // Create list item
        const listItem = document.createElement('li');
        listItem.className = 'thread-item';
        
        // Format date
        const created = formatDate(thread.created_at);
        
        // Build the thread HTML
        listItem.innerHTML = `
            <div class="thread-header">
                <span class="thread-title">${escapeHtml(thread.title || 'Untitled Thread')}</span>
                <span class="thread-date">${created}</span>
            </div>
            <p>${escapeHtml(thread.preview || '').substring(0, 150)}${thread.preview && thread.preview.length > 150 ? '...' : ''}</p>
            <div class="thread-stats">
                <span>${thread.post_count || 0} posts</span>
                <span>Posted by: ${escapeHtml(thread.author || 'Anonymous')}</span>
            </div>
            <a href="/${boardName}/thread/${thread.id}" class="view-board">View Thread</a>
        `;
        
        return listItem;
    },
    
    // Function to create a thread detail view
    createThreadDetail: function(thread, boardName) {
        const threadDetail = document.createElement('div');
        threadDetail.className = 'thread-detail';
        
        // Thread title and info
        const headerHtml = `
            <div class="thread-detail-header">
                <h2>${escapeHtml(thread.title || 'Untitled Thread')}</h2>
                <span class="thread-date">Created on ${formatDate(thread.created_at)}</span>
            </div>
        `;
        
        // Posts list
        let postsHtml = '<div class="posts-list">';
        
        if (thread.posts && thread.posts.length > 0) {
            thread.posts.forEach((post, index) => {
                // OP (Original Post) is the first post
                const isOP = index === 0;
                
                postsHtml += `
                    <div class="post ${isOP ? 'op-post' : ''}">
                        <div class="post-info">
                            <span class="post-author">${escapeHtml(post.author || 'Anonymous')}</span>
                            <span class="post-date">${formatDate(post.created_at)}</span>
                            <span class="post-number">No.${post.id}</span>
                            ${isOP ? '<span class="op-tag">OP</span>' : ''}
                        </div>
                        <div class="post-content">
                            ${escapeHtml(post.content || '')}
                        </div>
                    </div>
                `;
            });
        } else {
            postsHtml += '<div class="no-posts">No posts in this thread.</div>';
        }
        
        postsHtml += '</div>';
        
        // Combine all parts
        threadDetail.innerHTML = headerHtml + postsHtml;
        
        return threadDetail;
    }
};