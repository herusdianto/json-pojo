/**
 * UI event bindings for JSON to POJO Converter
 */

/**
 * Bind clear button event
 * @param {Function} clearFn - Clear function to call
 */
function bindClearButton(clearFn) {
    const clearBtn = document.getElementById('clear-btn');
    clearBtn.addEventListener('click', clearFn);
}

/**
 * Bind format button event
 * @param {Function} formatFn - Format function to call
 */
function bindFormatButton(formatFn) {
    const formatBtn = document.getElementById('format-btn');
    formatBtn.addEventListener('click', formatFn);
}

/**
 * Bind example button event
 * @param {Function} loadExampleFn - Load example function to call
 */
function bindExampleButton(loadExampleFn) {
    const exampleBtn = document.getElementById('example-btn');
    exampleBtn.addEventListener('click', loadExampleFn);
}

/**
 * Bind class name change event
 */
function bindClassNameChange() {
    const classNameInput = document.getElementById('class-name');
    classNameInput.addEventListener('input', () => {
        // Update download all filename based on class name
    });
}

/**
 * Bind global actions (copy all, download all)
 * @param {Function} getAllCodeFn - Function to get all code
 */
function bindGlobalActions(getAllCodeFn) {
    const copyAllBtn = document.getElementById('copy-all-btn');
    const downloadAllBtn = document.getElementById('download-all-btn');

    copyAllBtn.addEventListener('click', () => {
        const allCode = getAllCodeFn();
        if (allCode) {
            navigator.clipboard.writeText(allCode)
                .then(() => showStatus('All classes copied to clipboard!', 'success'))
                .catch(() => showStatus('Failed to copy', 'error'));
        } else {
            showStatus('Nothing to copy', 'error');
        }
    });

    downloadAllBtn.addEventListener('click', () => {
        const allCode = getAllCodeFn();
        if (allCode) {
            const className = document.getElementById('class-name').value.trim() || 'MyClass';
            const blob = new Blob([allCode], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${className}_all.java`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showStatus('All classes downloaded!', 'success');
        } else {
            showStatus('Nothing to download', 'error');
        }
    });
}

/**
 * Bind auto-convert on input changes
 * @param {Function} convertFn - Convert function to call
 */
function bindAutoConvert(convertFn) {
    const inputs = [
        document.getElementById('class-name'),
        document.getElementById('package-name'),
        document.getElementById('json-input'),
        document.getElementById('use-data'),
        document.getElementById('use-builder'),
        document.getElementById('use-noargs'),
        document.getElementById('use-allargs'),
        document.getElementById('use-getter'),
        document.getElementById('use-setter'),
        document.getElementById('use-tostring'),
        document.getElementById('use-equals'),
        document.getElementById('use-jackson'),
        document.getElementById('use-private'),
        document.getElementById('generate-nested'),
        document.getElementById('use-primitives')
    ];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', convertFn);
            input.addEventListener('change', convertFn);
        }
    });
    // Also trigger convert after loading example
    const exampleBtn = document.getElementById('example-btn');
    if (exampleBtn) {
        exampleBtn.addEventListener('click', () => {
            setTimeout(convertFn, 100);
        });
    }
}

/**
 * Bind class box buttons (copy and download)
 */
function bindClassBoxButtons() {
    document.querySelectorAll('.class-box .copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-code');
            const textarea = document.createElement('textarea');
            textarea.innerHTML = code;
            const decodedCode = textarea.value;

            navigator.clipboard.writeText(decodedCode)
                .then(() => showStatus('Copied to clipboard!', 'success'))
                .catch(() => showStatus('Failed to copy', 'error'));
        });
    });

    document.querySelectorAll('.class-box .download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-code');
            const filename = btn.getAttribute('data-filename');

            const textarea = document.createElement('textarea');
            textarea.innerHTML = code;
            const decodedCode = textarea.value;

            const blob = new Blob([decodedCode], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showStatus(`Downloaded ${filename}!`, 'success');
        });
    });
}

/**
 * Render class boxes in the output container
 * @param {string} header - Package and imports header
 * @param {string} mainClassName - Main class name
 * @param {Map} generatedClasses - Map of generated classes
 * @param {Map} classUsedTypes - Map of used types per class
 * @param {Object} options - Conversion options
 * @param {Function} getImportsForUsedTypesFn - Function to get imports for used types
 */
function renderClassBoxes(header, mainClassName, generatedClasses, classUsedTypes, options, getImportsForUsedTypesFn) {
    const container = document.getElementById('classes-container');
    container.innerHTML = '';

    // Render main class first, then nested classes
    const classNames = [mainClassName, ...Array.from(generatedClasses.keys()).filter(name => name !== mainClassName)];

    classNames.forEach((name, index) => {
        const classCode = generatedClasses.get(name);
        if (!classCode) return;

        const usedTypes = classUsedTypes.get(name) || new Set();
        let classHeader = '';
        if (header.startsWith('package ')) {
            classHeader += header.split('\n')[0] + '\n\n';
        }
        const imports = getImportsForUsedTypesFn(usedTypes, options);
        if (imports.length > 0) {
            classHeader += imports.join('\n') + '\n\n';
        }

        const fullCode = classHeader + classCode;

        const box = document.createElement('div');
        box.className = 'class-box';
        box.innerHTML = `
            <div class="class-box-header">
                <span class="class-name">${name}.java</span>
                <div class="class-box-actions">
                    <button class="copy-btn" data-code="${escapeHtml(fullCode)}">Copy</button>
                    <button class="download-btn" data-code="${escapeHtml(fullCode)}" data-filename="${name}.java">Download</button>
                </div>
            </div>
            <pre class="class-code"><code>${escapeHtml(fullCode)}</code></pre>
        `;
        container.appendChild(box);
    });

    // Bind copy/download buttons for new boxes
    bindClassBoxButtons();
}

/**
 * Get all code from class boxes
 * @returns {string} All code concatenated
 */
function getAllCode() {
    let allCode = '';
    document.querySelectorAll('.class-box .copy-btn').forEach((btn, index) => {
        const code = btn.getAttribute('data-code');
        const textarea = document.createElement('textarea');
        textarea.innerHTML = code;
        if (index > 0) allCode += '\n\n';
        allCode += textarea.value;
    });
    return allCode;
}

/**
 * Bind POJO to JSON actions
 * @param {Function} convertFn - Convert function
 * @param {Function} clearFn - Clear function
 * @param {Function} copyFn - Copy function
 * @param {Function} downloadFn - Download function
 */
function bindPojoToJsonActions(convertFn, clearFn, copyFn, downloadFn) {
    const convertBtn = document.getElementById('pojo-to-json-btn');
    const clearBtn = document.getElementById('pojo-clear-btn');
    const copyBtn = document.getElementById('pojo-copy-btn');
    const downloadBtn = document.getElementById('pojo-download-btn');

    if (convertBtn) {
        convertBtn.addEventListener('click', convertFn);
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFn);
    }
    if (copyBtn) {
        copyBtn.addEventListener('click', copyFn);
    }
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadFn);
    }
}
