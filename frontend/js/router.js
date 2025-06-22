// Router configuration
const ForumRouter = {
    routes: {
        home: {
            template: 'templates/boards-template.html',
            controller: ForumControllers.loadBoards
        },
        board: {
            template: 'templates/threads-template.html',
            controller: ForumControllers.loadThreads
        },
        thread: {
            template: 'templates/thread-template.html', 
            controller: ForumControllers.loadThread
        }
    },
    
    init: function() {
        // Parse the current URL
        this.handleUrl();
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.handleUrl();
        });
    },
    
    handleUrl: function() {
        const path = window.location.pathname;
        const appContainer = document.getElementById('app-container');
        
        // Default content
        let route = this.routes.home;
        let params = {};
        
        // Parse URL path to determine which page to load
        if (path === '/' || path === '/index.html') {
            // Home page - show boards
            document.title = 'Forum Boards';
            route = this.routes.home;
        } else if (path.match(/^\/[a-zA-Z0-9_-]+$/)) {
            // Board page - show threads for that board
            const boardName = path.substring(1); // Remove the leading '/'
            params.boardName = boardName;
            document.title = `${boardName} - Threads`;
            route = this.routes.board;
        } else if (path.match(/^\/[a-zA-Z0-9_-]+\/thread\/\d+$/)) {
            // Thread page - show a specific thread
            const parts = path.split('/');
            params.boardName = parts[1];
            params.threadId = parts[3];
            document.title = `Thread #${params.threadId}`;
            route = this.routes.thread;
        }
        
        // Load the template and initialize controller
        this.loadTemplate(route.template, appContainer, () => {
            if (route.controller) {
                route.controller(params);
            }
        });
    },
    
    loadTemplate: function(templateUrl, container, callback) {
        fetch(templateUrl)
            .then(response => response.text())
            .then(html => {
                container.innerHTML = html;
                if (callback) callback();
            })
            .catch(error => {
                console.error('Error loading template:', error);
                container.innerHTML = '<div class="error">Error loading content</div>';
            });
    },
    
    navigateTo: function(url) {
        history.pushState(null, null, url);
        this.handleUrl();
    }
};

// Add global click handler for internal links to use the router
document.addEventListener('click', function(e) {
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
        ForumRouter.navigateTo(href);
    }
});