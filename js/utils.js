/**
 * Utility functions for JSON to POJO Converter
 */

/**
 * Convert string to camelCase
 * @param {string} str - Input string
 * @returns {string} camelCase string
 */
function toCamelCase(str) {
    return str
        .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
        .replace(/^./, char => char.toLowerCase());
}

/**
 * Convert string to PascalCase
 * @param {string} str - Input string
 * @returns {string} PascalCase string
 */
function toPascalCase(str) {
    const camelCase = toCamelCase(str);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * Simple singularization of a string
 * @param {string} str - Input string
 * @returns {string} Singularized string
 */
function singularize(str) {
    if (str.endsWith('ies')) {
        return str.slice(0, -3) + 'y';
    }
    if (str.endsWith('es')) {
        return str.slice(0, -2);
    }
    if (str.endsWith('s') && !str.endsWith('ss')) {
        return str.slice(0, -1);
    }
    return str;
}

/**
 * Escape HTML special characters
 * @param {string} text - Input text
 * @returns {string} Escaped HTML string
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show status message to user
 * @param {string} message - Status message
 * @param {string} type - Message type ('success' or 'error')
 */
function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.classList.remove('hidden');

    setTimeout(() => {
        statusEl.classList.add('hidden');
    }, 3000);
}

/**
 * Update statistics display
 * @param {number} classCount - Number of classes generated
 * @param {number} fieldCount - Number of fields generated
 * @param {number} annotationCount - Number of annotations generated
 */
function updateStats(classCount, fieldCount, annotationCount) {
    document.getElementById('stats').classList.remove('hidden');
    document.getElementById('class-count').textContent = classCount;
    document.getElementById('field-count').textContent = fieldCount;
    document.getElementById('annotation-count').textContent = annotationCount;
}

/**
 * Set current year in footer
 */
function setCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}
