/**
 * Forum Application - Main Entry Point
 * Modern, clean architecture with proper separation of concerns
 */

class ForumApp {
    constructor() {
        this.router = null;
        this.api = null;
        this.ui = null;
        this.state = {
            currentBoard: null,
            currentThread: null,
            serverTime: null,
            isLoading: false,
            lastError: null
        };
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Listen for application events
        EventBus.on(Events.APP_ERROR, this.handleAppError.bind(this));
        EventBus.on(Events.DATA_ERROR, this.handleDataError.bind(this));
        EventBus.on(Events.UI_LOADING_START, this.setLoadingState.bind(this, true));
        EventBus.on(Events.UI_LOADING_END, this.setLoadingState.bind(this, false));
    }

    async init() {
        try {
            EventBus.emit(Events.UI_LOADING_START);
            
            // Initialize core modules
            this.api = new ForumAPI();
            this.ui = new ForumUI();
            this.router = new ForumRouter(this);
            
            // Initialize router
            this.router.init();
            
            // Get initial server time
            await this.api.getServerTime();
            
            // Update state
            this.setState({ 
                isLoading: false,
                lastError: null 
            });
            
            EventBus.emit(Events.UI_LOADING_END);
            EventBus.emit(Events.APP_INITIALIZED);
            
            if (Config.DEBUG.ENABLED) {
                console.log('Forum app initialized successfully');
                this.logAppState();
            }
        } catch (error) {
            this.handleAppError(error);
        }
    }

    // State management
    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        // Emit state change event if needed
        if (JSON.stringify(oldState) !== JSON.stringify(this.state)) {
            EventBus.emit(Events.DATA_UPDATED, this.state);
        }
    }

    getState() {
        return { ...this.state };
    }

    // Error handling
    handleAppError(error) {
        console.error('Application error:', error);
        
        this.setState({ 
            isLoading: false,
            lastError: error.message || 'Unknown error occurred'
        });
        
        EventBus.emit(Events.APP_ERROR, error);
        this.ui.showError(error.message || 'Application error occurred');
    }

    handleDataError(error) {
        console.error('Data error:', error);
        
        this.setState({ 
            isLoading: false,
            lastError: error.message || 'Data error occurred'
        });
        
        EventBus.emit(Events.DATA_ERROR, error);
    }

    setLoadingState(isLoading) {
        this.setState({ isLoading });
    }

    // Debug methods
    logAppState() {
        if (Config.DEBUG.ENABLED) {
            console.log('Current app state:', this.state);
        }
    }

    // Public API methods
    async refreshData() {
        try {
            EventBus.emit(Events.UI_LOADING_START);
            
            // Clear cache
            this.api.clearCache();
            EventBus.emit(Events.CACHE_CLEARED);
            
            // Reload current route
            if (this.router) {
                this.router.handleUrl();
            }
            
            EventBus.emit(Events.UI_LOADING_END);
        } catch (error) {
            this.handleDataError(error);
        }
    }

    // Cleanup
    destroy() {
        // Remove event listeners
        EventBus.off(Events.APP_ERROR);
        EventBus.off(Events.DATA_ERROR);
        EventBus.off(Events.UI_LOADING_START);
        EventBus.off(Events.UI_LOADING_END);
        
        // Clear cache
        if (this.api) {
            this.api.clearCache();
        }
        
        // Clear event bus
        EventBus.clear();
        
        console.log('Forum app destroyed');
    }
}

// Global app instance
window.forumApp = new ForumApp();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.forumApp.init();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.forumApp) {
        window.forumApp.destroy();
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    if (window.forumApp) {
        window.forumApp.handleAppError(event.error);
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    if (window.forumApp) {
        window.forumApp.handleAppError(event.reason);
    }
}); 