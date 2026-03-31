/**
 * Local storage operations for JSON to POJO Converter
 */

/**
 * Save JSON to POJO data to localStorage
 * @param {string} input - JSON input value
 * @param {Object} options - Conversion options
 * @param {string} packageName - Package name
 * @param {string} className - Class name
 */
function saveToLocalStorage(input, options, packageName, className) {
    localStorage.setItem('jsonpojo_input', input);
    localStorage.setItem('jsonpojo_options', JSON.stringify(options));
    localStorage.setItem('jsonpojo_package', packageName);
    localStorage.setItem('jsonpojo_classname', className);
}

/**
 * Restore JSON to POJO data from localStorage
 * @returns {Object} Restored data
 */
function restoreFromLocalStorage() {
    const input = localStorage.getItem('jsonpojo_input');
    const options = localStorage.getItem('jsonpojo_options');
    const packageName = localStorage.getItem('jsonpojo_package');
    const className = localStorage.getItem('jsonpojo_classname');
    
    return {
        input: input !== null ? input : null,
        options: options !== null ? JSON.parse(options) : null,
        packageName: packageName !== null ? packageName : null,
        className: className !== null ? className : null
    };
}

/**
 * Save POJO to JSON data to localStorage
 * @param {string} pojoInput - POJO input value
 */
function savePojoToJsonToLocalStorage(pojoInput) {
    localStorage.setItem('jsonpojo_pojo_input', pojoInput);
}

/**
 * Restore POJO to JSON data from localStorage
 * @returns {string|null} Restored POJO input
 */
function restorePojoToJsonFromLocalStorage() {
    return localStorage.getItem('jsonpojo_pojo_input');
}

/**
 * Get options from form elements
 * @returns {Object} Options object
 */
function getOptions() {
    return {
        useData: document.getElementById('use-data').checked,
        useBuilder: document.getElementById('use-builder').checked,
        useNoArgs: document.getElementById('use-noargs').checked,
        useAllArgs: document.getElementById('use-allargs').checked,
        useGetter: document.getElementById('use-getter').checked,
        useSetter: document.getElementById('use-setter').checked,
        useToString: document.getElementById('use-tostring').checked,
        useEquals: document.getElementById('use-equals').checked,
        useJackson: document.getElementById('use-jackson').checked,
        usePrivate: document.getElementById('use-private').checked,
        generateNested: document.getElementById('generate-nested').checked,
        usePrimitives: document.getElementById('use-primitives').checked
    };
}

/**
 * Apply options to form elements
 * @param {Object} options - Options object
 */
function applyOptions(options) {
    const form = document.querySelector('.settings-section');
    if (!form) return;
    
    form.querySelectorAll('input,select,textarea').forEach(el => {
        if (el.type === 'checkbox') {
            el.checked = !!options[el.name];
        } else if (options[el.name] !== undefined) {
            el.value = options[el.name];
        }
    });
}
