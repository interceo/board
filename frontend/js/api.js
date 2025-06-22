/**
 * Forum API Client
 * Handles all API communication with the backend
 */

class ForumAPI {
    constructor() {
        this.BASE_URL = Config.API.BASE_URL;
        this.cache = new Map();
        this.cacheTimeout = Config.CACHE.DEFAULT_TTL;
        this.maxCacheSize = Config.CACHE.MAX_SIZE;
    }

    async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), Config.API.TIMEOUT);
        config.signal = controller.signal;

        try {
            if (Config.DEBUG.SHOW_API_LOGS) {
                console.log(`API Request: ${config.method || 'GET'} ${url}`);
            }

            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (Config.DEBUG.SHOW_API_LOGS) {
                console.log(`API Response:`, data);
            }
            
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new APIError('Request timeout', endpoint);
            }
            
            console.error(`API Error for ${endpoint}:`, error);
            throw new APIError(error.message, endpoint);
        }
    }

    async requestWithRetry(endpoint, options = {}) {
        let lastError;
        
        for (let attempt = 1; attempt <= Config.API.RETRY_ATTEMPTS; attempt++) {
            try {
                return await this.request(endpoint, options);
            } catch (error) {
                lastError = error;
                
                if (attempt < Config.API.RETRY_ATTEMPTS) {
                    await Utils.sleep(Config.API.RETRY_DELAY * attempt);
                }
            }
        }
        
        throw lastError;
    }

    // Cache management
    getCached(key) {
        if (!Config.CACHE.ENABLED) return null;
        
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCached(key, data) {
        if (!Config.CACHE.ENABLED) return;
        
        // Implement LRU cache eviction
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // Server time
    async getServerTime() {
        try {
            const data = await this.requestWithRetry('/time');
            const serverTimeElement = document.getElementById('server-time');
            
            if (serverTimeElement) {
                serverTimeElement.textContent = data.time || new Date().toLocaleString();
            }
            
            return data;
        } catch (error) {
            const serverTimeElement = document.getElementById('server-time');
            if (serverTimeElement) {
                serverTimeElement.textContent = 'Time unavailable';
            }
            throw error;
        }
    }

    // Boards API
    async getBoards() {
        const cacheKey = 'boards';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        const data = await this.requestWithRetry('/boards');
        this.setCached(cacheKey, data);
        return data;
    }

    async createBoard(boardName, boardData) {
        // Validate board name
        if (!Config.VALIDATION.ALLOWED_BOARD_CHARS.test(boardName)) {
            throw new Error('Invalid board name. Only letters, numbers, hyphens and underscores are allowed.');
        }

        const data = await this.requestWithRetry(`/create_board/${boardName}`, {
            method: 'POST',
            body: JSON.stringify(boardData)
        });
        
        // Clear boards cache after creation
        this.cache.delete('boards');
        return data;
    }

    // Threads API
    async getThreads(boardName) {
        const cacheKey = `threads_${boardName}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        const data = await this.requestWithRetry(`/${boardName}/threads`);
        this.setCached(cacheKey, data);
        return data;
    }

    async getThread(boardName, threadId) {
        const cacheKey = `thread_${boardName}_${threadId}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        const data = await this.requestWithRetry(`/${boardName}/thread/${threadId}`);
        this.setCached(cacheKey, data);
        return data;
    }

    async createThread(boardName, threadData) {
        // Validate thread data
        if (!threadData.title || threadData.title.length < Config.VALIDATION.MIN_THREAD_TITLE_LENGTH) {
            throw new Error('Thread title is required');
        }
        
        if (threadData.title.length > Config.VALIDATION.MAX_THREAD_TITLE_LENGTH) {
            throw new Error(`Thread title must be less than ${Config.VALIDATION.MAX_THREAD_TITLE_LENGTH} characters`);
        }

        const data = await this.requestWithRetry(`/${boardName}/create_thread`, {
            method: 'POST',
            body: JSON.stringify(threadData)
        });
        
        // Clear related caches
        this.cache.delete(`threads_${boardName}`);
        return data;
    }

    async createPost(boardName, threadId, postData) {
        // Validate post data
        if (!postData.content || postData.content.length < Config.VALIDATION.MIN_POST_LENGTH) {
            throw new Error('Post content is required');
        }
        
        if (postData.content.length > Config.VALIDATION.MAX_POST_LENGTH) {
            throw new Error(`Post content must be less than ${Config.VALIDATION.MAX_POST_LENGTH} characters`);
        }

        const data = await this.requestWithRetry(`/${boardName}/${threadId}/create_post`, {
            method: 'POST',
            body: JSON.stringify(postData)
        });
        
        // Clear related caches
        this.cache.delete(`thread_${boardName}_${threadId}`);
        this.cache.delete(`threads_${boardName}`);
        return data;
    }
}

// Custom API Error class
class APIError extends Error {
    constructor(message, endpoint) {
        super(message);
        this.name = 'APIError';
        this.endpoint = endpoint;
        this.timestamp = new Date();
    }
}