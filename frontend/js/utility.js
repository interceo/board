// Helper function to escape HTML (prevent XSS)
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Format date function
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
        return new Date(dateString).toLocaleString();
    } catch (e) {
        console.error('Error formatting date:', e);
        return dateString;
    }
}

// Add a show element function
function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
}

// Add a hide element function
function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

// Display error message
function showError(message, elementId = 'error') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}