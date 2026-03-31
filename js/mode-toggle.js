/**
 * Mode toggle functionality for JSON to POJO Converter
 */

/**
 * Initialize mode toggle between JSON to POJO and POJO to JSON
 */
function initModeToggle() {
    const modeTabs = document.querySelectorAll('.mode-tab');
    const jsonToPojoSection = document.getElementById('json-to-pojo-section');
    const pojoToJsonSection = document.getElementById('pojo-to-json-section');

    if (!modeTabs.length) return;

    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = tab.getAttribute('data-mode');
            
            // Update active tab
            modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding section
            if (mode === 'json-to-pojo') {
                jsonToPojoSection.classList.add('active');
                pojoToJsonSection.classList.remove('active');
                localStorage.setItem('jsonpojo_mode', 'json-to-pojo');
            } else {
                jsonToPojoSection.classList.remove('active');
                pojoToJsonSection.classList.add('active');
                localStorage.setItem('jsonpojo_mode', 'pojo-to-json');
            }
        });
    });

    // Restore mode from localStorage
    const savedMode = localStorage.getItem('jsonpojo_mode');
    if (savedMode === 'pojo-to-json') {
        modeTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('.mode-tab[data-mode="pojo-to-json"]').classList.add('active');
        jsonToPojoSection.classList.remove('active');
        pojoToJsonSection.classList.add('active');
    }
}
