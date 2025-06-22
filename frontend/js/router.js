/**
 * Forum Router
 * Handles client-side routing and page navigation
 */

class ForumRouter {
    constructor(app) {
        this.app = app;
        this.routes = {
            home: {
                template: 'templates/boards-template.html',
                controller: this.loadBoards.bind(this)
            },
            board: {
                template: 'templates/threads-template.html',
                controller: this.loadThreads.bind(this)
            },
            thread: {
                template: 'templates/thread-template.html',
                controller: this.loadThread.bind(this)
            }
        };
        
        this.currentRoute = null;
        this.currentParams = {};
    }

    init() {
        // Parse the current URL
        this.handleUrl();
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.handleUrl();
        });

        // Handle internal link clicks
        document.addEventListener('click', this.handleLinkClick.bind(this));
    }

    handleLinkClick(e) {
        // Find closest anchor element
        let target = e.target;
        while (target && target.tagName !== 'A') {
            target = target.parentNode;
            if (!target) return;
        }
        
        // Check if it's an internal link
        const href = target.getAttribute('href');
        if (href && href.startsWith('/')) {
            e.preventDefault();
            this.navigateTo(href);
        }
    }

    handleUrl() {
        const path = window.location.pathname;
        const appContainer = document.getElementById('app-container');
        
        if (!appContainer) {
            console.error('App container not found');
            return;
        }

        // Parse URL path to determine which page to load
        const routeInfo = this.parseRoute(path);
        
        // Update current route info
        this.currentRoute = routeInfo.route;
        this.currentParams = routeInfo.params;
        
        // Update document title
        document.title = routeInfo.title;
        
        // Load the template and initialize controller
        this.loadTemplate(routeInfo.route.template, appContainer, () => {
            if (routeInfo.route.controller) {
                routeInfo.route.controller(routeInfo.params);
            }
        });
    }

    parseRoute(path) {
        // Default route
        let route = this.routes.home;
        let params = {};
        let title = 'Forum Boards';

        // Parse URL path to determine which page to load
        if (path === '/' || path === '/index.html') {
            // Home page - show boards
            route = this.routes.home;
        } else if (path.match(/^\/[a-zA-Z0-9_-]+$/)) {
            // Board page - show threads for that board
            const boardName = path.substring(1); // Remove the leading '/'
            params.boardName = boardName;
            title = `${boardName} - Threads`;
            route = this.routes.board;
        } else if (path.match(/^\/[a-zA-Z0-9_-]+\/thread\/\d+$/)) {
            // Thread page - show a specific thread
            const parts = path.split('/');
            params.boardName = parts[1];
            params.threadId = parts[3];
            title = `Thread #${params.threadId}`;
            route = this.routes.thread;
        }

        return { route, params, title };
    }

    async loadTemplate(templateUrl, container, callback) {
        try {
            await this.app.ui.renderTemplate(templateUrl, container);
            if (callback) callback();
        } catch (error) {
            console.error('Error loading template:', error);
            container.innerHTML = this.app.ui.getErrorHTML('Error loading content');
        }
    }

    navigateTo(url) {
        history.pushState(null, null, url);
        this.handleUrl();
    }

    // Route controllers
    async loadBoards() {
        const boardsContainer = document.getElementById('boards-container');
        if (!boardsContainer) return;

        try {
            this.app.ui.showLoading('loading');
            this.app.ui.hideError();

            const boards = await this.app.api.getBoards();
            
            this.app.ui.hideLoading('loading');
            this.app.ui.renderBoards(boards, boardsContainer);
            
            // Update app state
            this.app.setState({ currentBoard: null, currentThread: null });
            
        } catch (error) {
            this.app.ui.hideLoading('loading');
            this.app.ui.showError('Failed to load boards. Please try again later.');
        }
    }

    async loadThreads(params) {
        const { boardName } = params;
        const threadsContainer = document.getElementById('threads-container');
        const boardNameElement = document.getElementById('board-name');
        const createThreadLink = document.getElementById('create-thread-link');

        if (!threadsContainer) return;

        // Update UI elements
        if (boardNameElement) {
            boardNameElement.textContent = boardName;
        }

        if (createThreadLink) {
            createThreadLink.href = `/${boardName}/create`;
        }

        try {
            this.app.ui.showLoading('loading');
            this.app.ui.hideError();

            const threads = await this.app.api.getThreads(boardName);
            
            this.app.ui.hideLoading('loading');
            this.app.ui.renderThreads(threads, boardName, threadsContainer);
            
            // Update app state
            this.app.setState({ currentBoard: boardName, currentThread: null });
            
        } catch (error) {
            this.app.ui.hideLoading('loading');
            this.app.ui.showError('Failed to load threads. Please try again later.');
        }
    }

    async loadThread(params) {
        const { boardName, threadId } = params;
        const threadContainer = document.getElementById('thread-container');
        const backButton = document.getElementById('back-to-board');

        if (!threadContainer) return;

        // Update back button
        if (backButton) {
            backButton.href = `/${boardName}`;
        }

        try {
            this.app.ui.showLoading('loading');
            this.app.ui.hideError();

            const thread = await this.app.api.getThread(boardName, threadId);
            
            this.app.ui.hideLoading('loading');
            this.app.ui.renderThreadDetail(thread, boardName, threadContainer);
            
            // Show reply form and setup handlers
            this.app.ui.showElement('reply-form');
            this.app.ui.setupReplyForm(boardName, threadId);
            
            // Update app state
            this.app.setState({ currentBoard: boardName, currentThread: threadId });
            
        } catch (error) {
            this.app.ui.hideLoading('loading');
            this.app.ui.showError('Failed to load thread. Please try again later.');
        }
    }
}