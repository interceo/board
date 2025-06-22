/**
 * Event Management System
 * Centralized event handling for the application
 */

class EventManager {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Function to call when event occurs
     * @param {Object} context - Context to bind the callback to
     */
    on(eventName, callback, context = null) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        
        this.events.get(eventName).push({
            callback,
            context
        });
    }

    /**
     * Subscribe to an event that will only fire once
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Function to call when event occurs
     * @param {Object} context - Context to bind the callback to
     */
    once(eventName, callback, context = null) {
        if (!this.onceEvents.has(eventName)) {
            this.onceEvents.set(eventName, []);
        }
        
        this.onceEvents.get(eventName).push({
            callback,
            context
        });
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Specific callback to remove
     */
    off(eventName, callback = null) {
        if (callback) {
            // Remove specific callback
            if (this.events.has(eventName)) {
                const callbacks = this.events.get(eventName);
                const index = callbacks.findIndex(item => item.callback === callback);
                if (index !== -1) {
                    callbacks.splice(index, 1);
                }
            }
            
            if (this.onceEvents.has(eventName)) {
                const callbacks = this.onceEvents.get(eventName);
                const index = callbacks.findIndex(item => item.callback === callback);
                if (index !== -1) {
                    callbacks.splice(index, 1);
                }
            }
        } else {
            // Remove all callbacks for this event
            this.events.delete(eventName);
            this.onceEvents.delete(eventName);
        }
    }

    /**
     * Emit an event
     * @param {string} eventName - Name of the event
     * @param {...any} args - Arguments to pass to callbacks
     */
    emit(eventName, ...args) {
        // Call regular event handlers
        if (this.events.has(eventName)) {
            const callbacks = this.events.get(eventName);
            callbacks.forEach(({ callback, context }) => {
                try {
                    if (context) {
                        callback.apply(context, args);
                    } else {
                        callback(...args);
                    }
                } catch (error) {
                    console.error(`Error in event handler for ${eventName}:`, error);
                }
            });
        }

        // Call once event handlers and remove them
        if (this.onceEvents.has(eventName)) {
            const callbacks = this.onceEvents.get(eventName);
            callbacks.forEach(({ callback, context }) => {
                try {
                    if (context) {
                        callback.apply(context, args);
                    } else {
                        callback(...args);
                    }
                } catch (error) {
                    console.error(`Error in once event handler for ${eventName}:`, error);
                }
            });
            this.onceEvents.delete(eventName);
        }
    }

    /**
     * Get the number of listeners for an event
     * @param {string} eventName - Name of the event
     * @returns {number} - Number of listeners
     */
    listenerCount(eventName) {
        let count = 0;
        
        if (this.events.has(eventName)) {
            count += this.events.get(eventName).length;
        }
        
        if (this.onceEvents.has(eventName)) {
            count += this.onceEvents.get(eventName).length;
        }
        
        return count;
    }

    /**
     * Remove all event listeners
     */
    clear() {
        this.events.clear();
        this.onceEvents.clear();
    }
}

// Global event manager instance
window.EventBus = new EventManager();

// Predefined event names
const Events = {
    // Application events
    APP_INITIALIZED: 'app:initialized',
    APP_ERROR: 'app:error',
    
    // Navigation events
    ROUTE_CHANGED: 'route:changed',
    ROUTE_ERROR: 'route:error',
    
    // Data events
    DATA_LOADED: 'data:loaded',
    DATA_ERROR: 'data:error',
    DATA_UPDATED: 'data:updated',
    
    // UI events
    UI_LOADING_START: 'ui:loading:start',
    UI_LOADING_END: 'ui:loading:end',
    UI_ERROR_SHOWN: 'ui:error:shown',
    UI_ERROR_HIDDEN: 'ui:error:hidden',
    
    // Board events
    BOARD_LOADED: 'board:loaded',
    BOARD_CREATED: 'board:created',
    BOARD_ERROR: 'board:error',
    
    // Thread events
    THREAD_LOADED: 'thread:loaded',
    THREAD_CREATED: 'thread:created',
    THREAD_ERROR: 'thread:error',
    
    // Post events
    POST_CREATED: 'post:created',
    POST_ERROR: 'post:error',
    
    // Form events
    FORM_SUBMITTED: 'form:submitted',
    FORM_VALIDATION_ERROR: 'form:validation:error',
    
    // Cache events
    CACHE_CLEARED: 'cache:cleared',
    CACHE_UPDATED: 'cache:updated'
}; 