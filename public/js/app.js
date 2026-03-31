/**
 * Main entry point for JSON to POJO Converter
 */

class JsonToPojoConverter {
    constructor() {
        this.classCount = 0;
        this.fieldCount = 0;
        this.annotationCount = 0;
        this.generatedClasses = new Map();
        this.classUsedTypes = new Map();
        this._hasLocalDate = false;
        this._hasLocalDateTime = false;
        this._hasInstant = false;
        this.init();
    }

    init() {
        // Cache frequently used DOM elements
        this.jsonInput = document.getElementById('json-input');
        this.optionsForm = document.querySelector('.settings-section');
        this.outputContainer = document.getElementById('classes-container');
        
        // Restore from localStorage if available
        this.restoreFromLocalStorage();
        this.restorePojoToJsonFromLocalStorage();
        
        // Bind event handlers
        this.bindAutoConvert();
        this.bindClearButton();
        this.bindFormatButton();
        this.bindExampleButton();
        this.bindGlobalActions();
        initThemeToggle();
        this.bindClassNameChange();
        setCurrentYear();
        this.bindPojoToJsonActions();
        initModeToggle();
    }

    restoreFromLocalStorage() {
        const data = restoreFromLocalStorage();
        if (data.input !== null) {
            this.jsonInput.value = data.input;
        }
        if (data.packageName !== null) {
            document.getElementById('package-name').value = data.packageName;
        }
        if (data.className !== null) {
            document.getElementById('class-name').value = data.className;
        }
        if (data.options !== null) {
            applyOptions(data.options);
        }
        // Trigger auto-convert if input/options exist
        if (data.input !== null || data.options !== null) {
            this.convert();
        }
    }

    restorePojoToJsonFromLocalStorage() {
        const pojoInput = restorePojoToJsonFromLocalStorage();
        if (pojoInput !== null) {
            document.getElementById('pojo-input').value = pojoInput;
            convertPojoToJson(pojoInput);
        }
    }

    bindClearButton() {
        const clearFn = () => this.clear();
        bindClearButton(clearFn);
    }

    bindFormatButton() {
        const formatFn = () => this.formatJson();
        bindFormatButton(formatFn);
    }

    bindExampleButton() {
        const loadExampleFn = () => this.loadExample();
        bindExampleButton(loadExampleFn);
    }

    bindClassNameChange() {
        bindClassNameChange();
    }

    bindGlobalActions() {
        const getAllCodeFn = () => getAllCode();
        bindGlobalActions(getAllCodeFn);
    }

    bindAutoConvert() {
        const convertFn = () => this.convert();
        bindAutoConvert(convertFn);
    }

    bindPojoToJsonActions() {
        const convertFn = () => {
            const pojoInput = document.getElementById('pojo-input').value.trim();
            convertPojoToJson(pojoInput);
        };
        const clearFn = () => clearPojoToJson();
        const copyFn = () => copyPojoToJson();
        const downloadFn = () => downloadPojoToJson();
        bindPojoToJsonActions(convertFn, clearFn, copyFn, downloadFn);
    }

    clear() {
        document.getElementById('json-input').value = '';
        document.getElementById('classes-container').innerHTML = '<div class="empty-state"><p>Java POJO classes will appear here...</p></div>';
        document.getElementById('stats').classList.add('hidden');
        document.getElementById('global-actions').classList.add('hidden');
        showStatus('Cleared!', 'success');
        this.saveToLocalStorage();
    }

    loadExample() {
        const exampleJson = {
            "id": 1,
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com",
            "age": 30,
            "active": true,
            "salary": 75000.50,
            "address": {
                "street": "123 Main Street",
                "city": "New York",
                "state": "NY",
                "zipCode": "10001",
                "country": "USA"
            },
            "phoneNumbers": [
                {
                    "type": "home",
                    "number": "212-555-1234"
                },
                {
                    "type": "mobile",
                    "number": "646-555-5678"
                }
            ],
            "roles": ["admin", "user", "manager"],
            "metadata": {
                "createdAt": "2024-01-15T10:30:00Z",
                "updatedAt": "2024-03-20T14:45:00Z",
                "version": 2
            }
        };

        document.getElementById('json-input').value = JSON.stringify(exampleJson, null, 2);
        document.getElementById('class-name').value = 'User';
        document.getElementById('package-name').value = 'com.example.model';

        // Set options checked state
        document.getElementById('use-data').checked = true;
        document.getElementById('use-builder').checked = true;
        document.getElementById('use-noargs').checked = true;
        document.getElementById('use-allargs').checked = true;
        document.getElementById('use-getter').checked = false;
        document.getElementById('use-setter').checked = false;
        document.getElementById('use-tostring').checked = true;
        document.getElementById('use-equals').checked = false;
        document.getElementById('use-jackson').checked = true;
        document.getElementById('use-private').checked = true;
        document.getElementById('generate-nested').checked = true;
        document.getElementById('use-primitives').checked = false;

        showStatus('Example JSON loaded!', 'success');

        // Trigger convert after loading example
        setTimeout(() => this.convert(), 100);
        this.saveToLocalStorage();
    }

    formatJson() {
        const jsonInput = document.getElementById('json-input');
        try {
            const parsed = JSON.parse(jsonInput.value);
            jsonInput.value = JSON.stringify(parsed, null, 2);
            showStatus('JSON formatted!', 'success');
        } catch (e) {
            showStatus('Invalid JSON: ' + e.message, 'error');
        }
    }

    convert() {
        // Reset Java time usage flags before each conversion
        this._hasLocalDate = false;
        this._hasLocalDateTime = false;
        this._hasInstant = false;
        this.classUsedTypes.clear();

        const jsonInput = document.getElementById('json-input').value.trim();
        const className = document.getElementById('class-name').value.trim() || 'MyClass';
        const packageName = document.getElementById('package-name').value.trim();

        if (!jsonInput) {
            showStatus('Please enter JSON to convert', 'error');
            return;
        }

        try {
            const jsonObj = JSON.parse(jsonInput);
            this.resetCounters();
            this.generatedClasses.clear();

            const options = getOptions();

            // Generate main class and nested classes
            generatePojo(className, jsonObj, options, this.generatedClasses, this.classUsedTypes, this);

            // Build header (package + imports)
            let header = '';
            if (packageName) {
                header += `package ${packageName};\n\n`;
            }
            const imports = collectImports(options, {
                hasLocalDate: this._hasLocalDate,
                hasLocalDateTime: this._hasLocalDateTime,
                hasInstant: this._hasInstant
            });
            if (imports.length > 0) {
                header += imports.join('\n') + '\n\n';
            }

            // Render separate boxes for each class
            renderClassBoxes(header, className, this.generatedClasses, this.classUsedTypes, options, getImportsForUsedTypes);

            updateStats(this.classCount, this.fieldCount, this.annotationCount);
            document.getElementById('global-actions').classList.remove('hidden');
            showStatus('Conversion successful!', 'success');
            this.saveToLocalStorage();
        } catch (e) {
            showStatus('Error: ' + e.message, 'error');
        }
    }

    resetCounters() {
        this.classCount = 0;
        this.fieldCount = 0;
        this.annotationCount = 0;
    }

    saveToLocalStorage() {
        const input = this.jsonInput.value;
        const options = getOptions();
        const packageName = document.getElementById('package-name').value;
        const className = document.getElementById('class-name').value;
        saveToLocalStorage(input, options, packageName, className);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new JsonToPojoConverter();
    
    // Mode toggle functionality
    const modeJsonToPojo = document.getElementById('mode-json-to-pojo');
    const modePojoToJson = document.getElementById('mode-pojo-to-json');
    const jsonToPojoSection = document.getElementById('json-to-pojo-section');
    const pojoToJsonSection = document.getElementById('pojo-to-json-section');

    if (modeJsonToPojo && modePojoToJson) {
        modeJsonToPojo.addEventListener('click', () => {
            modeJsonToPojo.classList.add('active');
            modePojoToJson.classList.remove('active');
            jsonToPojoSection.classList.remove('hidden');
            pojoToJsonSection.classList.add('hidden');
        });

        modePojoToJson.addEventListener('click', () => {
            modePojoToJson.classList.add('active');
            modeJsonToPojo.classList.remove('active');
            pojoToJsonSection.classList.remove('hidden');
            jsonToPojoSection.classList.add('hidden');
        });
    }
});
