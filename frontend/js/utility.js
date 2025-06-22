/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

class Utils {
    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} unsafe - The string to escape
     * @returns {string} - Escaped string
     */
    static escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = unsafe;
        return div.innerHTML;
    }

    /**
     * Format date string to readable format
     * @param {string} dateString - Date string to format
     * @returns {string} - Formatted date string
     */
    static formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            
            return date.toLocaleString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }

    /**
     * Format relative time (e.g., "2 hours ago")
     * @param {string} dateString - Date string to format
     * @returns {string} - Relative time string
     */
    static formatRelativeTime(dateString) {
        if (!dateString) return 'Unknown time';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            
            return this.formatDate(dateString);
        } catch (error) {
            console.error('Error formatting relative time:', error);
            return this.formatDate(dateString);
        }
    }

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function to limit function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} - Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Generate a random ID
     * @param {number} length - Length of the ID
     * @returns {string} - Random ID
     */
    static generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add if truncated
     * @returns {string} - Truncated text
     */
    static truncateText(text, maxLength = 100, suffix = '...') {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * Get URL parameters
     * @returns {Object} - URL parameters object
     */
    static getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    /**
     * Set URL parameter
     * @param {string} key - Parameter key
     * @param {string} value - Parameter value
     */
    static setUrlParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url);
    }

    /**
     * Remove URL parameter
     * @param {string} key - Parameter key to remove
     */
    static removeUrlParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.replaceState({}, '', url);
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} - Success status
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    /**
     * Sleep for specified milliseconds
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} - Promise that resolves after sleep
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Legacy function aliases for backward compatibility
function escapeHtml(unsafe) {
    return Utils.escapeHtml(unsafe);
}

function formatDate(dateString) {
    return Utils.formatDate(dateString);
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

function showError(message, elementId = 'error') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}