/**
 * Forum UI Manager
 * Handles all UI rendering and DOM manipulation
 */

class ForumUI {
    constructor() {
        this.templates = new Map();
        this.loadingStates = new Set();
    }

    // Template management
    async loadTemplate(templatePath) {
        if (this.templates.has(templatePath)) {
            return this.templates.get(templatePath);
        }

        try {
            const response = await fetch(templatePath);
            const html = await response.text();
            this.templates.set(templatePath, html);
            return html;
        } catch (error) {
            console.error(`Failed to load template: ${templatePath}`, error);
            throw new Error(`Template not found: ${templatePath}`);
        }
    }

    async renderTemplate(templatePath, container, data = {}) {
        try {
            const html = await this.loadTemplate(templatePath);
            const renderedHtml = this.interpolateTemplate(html, data);
            container.innerHTML = renderedHtml;
        } catch (error) {
            container.innerHTML = this.getErrorHTML('Failed to load content');
            throw error;
        }
    }

    interpolateTemplate(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || '';
        });
    }

    // Loading states
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
            this.loadingStates.add(elementId);
        }
    }

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
            this.loadingStates.delete(elementId);
        }
    }

    // Error handling
    showError(message, elementId = 'error') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.remove('hidden');
        }
    }

    hideError(elementId = 'error') {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    getErrorHTML(message) {
        return `<div class="error">${Utils.escapeHtml(message)}</div>`;
    }

    // Element visibility
    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    }

    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    // Board rendering
    createBoardCard(board) {
        const boardCard = document.createElement('div');
        boardCard.className = 'board-card';
        
        boardCard.innerHTML = `
            <h2>${Utils.escapeHtml(board.name || 'Unnamed Board')}</h2>
            <p>${Utils.escapeHtml(board.description || 'No description')}</p>
            <div class="board-stats">
                <span>${board.thread_count || 0} threads</span>
                <span>${board.post_count || 0} posts</span>
            </div>
            <a href="/${Utils.escapeHtml(board.name)}" class="view-board">View Board</a>
        `;
        
        return boardCard;
    }

    renderBoards(boards, container) {
        container.innerHTML = '';
        
        if (!boards || boards.length === 0) {
            container.innerHTML = '<div class="no-boards">No boards found</div>';
            return;
        }

        boards.forEach(board => {
            const boardElement = this.createBoardCard(board);
            container.appendChild(boardElement);
        });
    }

    // Thread rendering
    createThreadElement(thread, boardName) {
        const listItem = document.createElement('li');
        listItem.className = 'thread-item';
        
        const created = Utils.formatDate(thread.created_at);
        const preview = thread.preview || '';
        const truncatedPreview = preview.length > 150 ? 
            preview.substring(0, 150) + '...' : preview;
        
        listItem.innerHTML = `
            <div class="thread-header">
                <span class="thread-title">${Utils.escapeHtml(thread.title || 'Untitled Thread')}</span>
                <span class="thread-date">${created}</span>
            </div>
            <p>${Utils.escapeHtml(truncatedPreview)}</p>
            <div class="thread-stats">
                <span>${thread.post_count || 0} posts</span>
                <span>Posted by: ${Utils.escapeHtml(thread.author || 'Anonymous')}</span>
            </div>
            <a href="/${boardName}/thread/${thread.id}" class="view-board">View Thread</a>
        `;
        
        return listItem;
    }

    renderThreads(threads, boardName, container) {
        container.innerHTML = '';
        
        if (!threads || threads.length === 0) {
            container.innerHTML = '<div class="no-threads">No threads found in this board</div>';
            return;
        }

        threads.forEach(thread => {
            const threadElement = this.createThreadElement(thread, boardName);
            container.appendChild(threadElement);
        });
    }

    // Thread detail rendering
    createThreadDetail(thread, boardName) {
        const threadDetail = document.createElement('div');
        threadDetail.className = 'thread-detail';
        
        const headerHtml = `
            <div class="thread-detail-header">
                <h2>${Utils.escapeHtml(thread.title || 'Untitled Thread')}</h2>
                <span class="thread-date">Created on ${Utils.formatDate(thread.created_at)}</span>
            </div>
        `;
        
        let postsHtml = '<div class="posts-list">';
        
        if (thread.posts && thread.posts.length > 0) {
            thread.posts.forEach((post, index) => {
                const isOP = index === 0;
                
                postsHtml += `
                    <div class="post ${isOP ? 'op-post' : ''}">
                        <div class="post-info">
                            <span class="post-author">${Utils.escapeHtml(post.author || 'Anonymous')}</span>
                            <span class="post-date">${Utils.formatDate(post.created_at)}</span>
                            <span class="post-number">No.${post.id}</span>
                            ${isOP ? '<span class="op-tag">OP</span>' : ''}
                        </div>
                        <div class="post-content">
                            ${Utils.escapeHtml(post.content || '')}
                        </div>
                    </div>
                `;
            });
        } else {
            postsHtml += '<div class="no-posts">No posts in this thread.</div>';
        }
        
        postsHtml += '</div>';
        threadDetail.innerHTML = headerHtml + postsHtml;
        
        return threadDetail;
    }

    renderThreadDetail(thread, boardName, container) {
        container.innerHTML = '';
        const threadElement = this.createThreadDetail(thread, boardName);
        container.appendChild(threadElement);
    }

    // Form handling
    setupReplyForm(boardName, threadId) {
        const postForm = document.getElementById('post-form');
        if (!postForm) return;

        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const author = document.getElementById('author').value || 'Anonymous';
            const content = document.getElementById('content').value;

            if (!content.trim()) {
                this.showError('Please enter a message');
                return;
            }

            try {
                this.hideError();
                await window.forumApp.api.createPost(boardName, threadId, { author, content });
                
                // Reload the thread
                window.forumApp.router.handleUrl();
            } catch (error) {
                this.showError('Failed to post reply');
            }
        });
    }
}