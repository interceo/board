/**
 * Application Configuration
 * Centralized configuration management
 */

const Config = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:8088',
        TIMEOUT: 10000, // 10 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1 second
    },

    // Cache Configuration
    CACHE: {
        ENABLED: true,
        DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
        MAX_SIZE: 100 // Maximum number of cached items
    },

    // UI Configuration
    UI: {
        LOADING_DELAY: 300, // Minimum loading time in ms
        ERROR_DISPLAY_TIME: 5000, // Error message display time
        ANIMATION_DURATION: 200, // CSS transition duration
        MAX_PREVIEW_LENGTH: 150, // Max thread preview length
        POSTS_PER_PAGE: 20
    },

    // Router Configuration
    ROUTER: {
        HISTORY_MODE: true, // Use HTML5 History API
        SCROLL_BEHAVIOR: 'smooth', // Smooth scrolling
        DEFAULT_ROUTE: '/'
    },

    // Validation Configuration
    VALIDATION: {
        MIN_POST_LENGTH: 1,
        MAX_POST_LENGTH: 10000,
        MIN_THREAD_TITLE_LENGTH: 1,
        MAX_THREAD_TITLE_LENGTH: 200,
        ALLOWED_BOARD_CHARS: /^[a-zA-Z0-9_-]+$/
    },

    // Feature Flags
    FEATURES: {
        REAL_TIME_UPDATES: false,
        RICH_TEXT_EDITOR: false,
        FILE_UPLOADS: false,
        USER_AVATARS: false,
        THREAD_SUBSCRIPTIONS: false
    },

    // Debug Configuration
    DEBUG: {
        ENABLED: false,
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        SHOW_API_LOGS: false,
        SHOW_PERFORMANCE_METRICS: false
    }
};

// Environment-specific overrides
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    Config.DEBUG.ENABLED = true;
    Config.DEBUG.SHOW_API_LOGS = true;
}

// Production overrides
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    Config.API.BASE_URL = 'https://your-production-api.com';
    Config.DEBUG.ENABLED = false;
    Config.CACHE.ENABLED = true;
    Config.CACHE.DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes in production
} 