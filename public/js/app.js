/**
 * JSON to POJO Converter - Convert JSON to Java POJO with Lombok
 * 100% Client-side processing
 */

class JsonToPojoConverter {
    constructor() {
        this.classCount = 0;
        this.fieldCount = 0;
        this.annotationCount = 0;
        this.generatedClasses = new Map();
        this.init();
    }

    init() {
        // Remove convert button and auto-trigger convert on input changes
        this.bindAutoConvert();
        this.bindClearButton();
        this.bindFormatButton();
        this.bindExampleButton();
        this.bindGlobalActions();
        this.initThemeToggle();
        this.bindClassNameChange();
        this.setCurrentYear();
    }

    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // ==================== Theme Toggle ====================
    initThemeToggle() {
        const themeSwitch = document.getElementById('theme-switch');
        const themeIcon = document.getElementById('theme-icon');

        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        this.updateThemeIcon(themeIcon, savedTheme);

        themeSwitch.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            const newTheme = isDark ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(themeIcon, newTheme);
        });
    }

    updateThemeIcon(iconElement, theme) {
        iconElement.innerHTML = theme === 'dark'
            ? `<svg class="sun-icon" viewBox="0 0 24 24" width="28" height="28"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zM2 13h2a1 1 0 100-2H2a1 1 0 100 2zm18 0h2a1 1 0 100-2h-2a1 1 0 100 2zM11 2v2a1 1 0 102 0V2a1 1 0 10-2 0zm0 18v2a1 1 0 102 0v-2a1 1 0 10-2 0zM5.99 4.58a1 1 0 10-1.41 1.41l1.06 1.06a1 1 0 101.41-1.41L5.99 4.58zm12.37 12.37a1 1 0 10-1.41 1.41l1.06 1.06a1 1 0 101.41-1.41l-1.06-1.06zm1.06-10.96a1 1 0 10-1.41-1.41l-1.06 1.06a1 1 0 101.41 1.41l1.06-1.06zM7.05 18.36a1 1 0 10-1.41-1.41l-1.06 1.06a1 1 0 101.41 1.41l1.06-1.06z"></path></svg>`
            : `<svg class="moon-icon" viewBox="0 0 24 24" width="28" height="28"><path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"></path></svg>`;
    }

    // ==================== Button Bindings ====================
    bindClearButton() {
        const clearBtn = document.getElementById('clear-btn');
        clearBtn.addEventListener('click', () => this.clear());
    }

    bindFormatButton() {
        const formatBtn = document.getElementById('format-btn');
        formatBtn.addEventListener('click', () => this.formatJson());
    }

    bindExampleButton() {
        const exampleBtn = document.getElementById('example-btn');
        exampleBtn.addEventListener('click', () => this.loadExample());
    }

    bindClassNameChange() {
        const classNameInput = document.getElementById('class-name');
        classNameInput.addEventListener('input', () => {
            // Update download all filename based on class name
        });
    }

    bindGlobalActions() {
        const copyAllBtn = document.getElementById('copy-all-btn');
        const downloadAllBtn = document.getElementById('download-all-btn');

        copyAllBtn.addEventListener('click', () => {
            const allCode = this.getAllCode();
            if (allCode) {
                navigator.clipboard.writeText(allCode)
                    .then(() => this.showStatus('All classes copied to clipboard!', 'success'))
                    .catch(() => this.showStatus('Failed to copy', 'error'));
            } else {
                this.showStatus('Nothing to copy', 'error');
            }
        });

        downloadAllBtn.addEventListener('click', () => {
            const allCode = this.getAllCode();
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
                this.showStatus('All classes downloaded!', 'success');
            } else {
                this.showStatus('Nothing to download', 'error');
            }
        });
    }

    // ==================== Auto Convert Bindings ====================
    bindAutoConvert() {
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
                input.addEventListener('input', () => this.convert());
                input.addEventListener('change', () => this.convert());
            }
        });
        // Also trigger convert after loading example
        const exampleBtn = document.getElementById('example-btn');
        if (exampleBtn) {
            exampleBtn.addEventListener('click', () => {
                setTimeout(() => this.convert(), 100); // Wait for example to load
            });
        }
    }

    // ==================== Core Functions ====================
    clear() {
        document.getElementById('json-input').value = '';
        document.getElementById('classes-container').innerHTML = '<div class="empty-state"><p>Java POJO classes will appear here...</p></div>';
        document.getElementById('stats').classList.add('hidden');
        document.getElementById('global-actions').classList.add('hidden');
        this.showStatus('Cleared!', 'success');
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
        this.showStatus('Example JSON loaded!', 'success');

        // Trigger convert after loading example
        setTimeout(() => this.convert(), 100);
    }

    formatJson() {
        const jsonInput = document.getElementById('json-input');
        try {
            const parsed = JSON.parse(jsonInput.value);
            jsonInput.value = JSON.stringify(parsed, null, 2);
            this.showStatus('JSON formatted!', 'success');
        } catch (e) {
            this.showStatus('Invalid JSON: ' + e.message, 'error');
        }
    }

    convert() {
        const jsonInput = document.getElementById('json-input').value.trim();
        const className = document.getElementById('class-name').value.trim() || 'MyClass';
        const packageName = document.getElementById('package-name').value.trim();

        if (!jsonInput) {
            this.showStatus('Please enter JSON to convert', 'error');
            return;
        }

        try {
            const jsonObj = JSON.parse(jsonInput);
            this.resetCounters();
            this.generatedClasses.clear();

            const options = this.getOptions();

            // Generate main class and nested classes
            this.generatePojo(className, jsonObj, options);

            // Build header (package + imports)
            let header = '';
            if (packageName) {
                header += `package ${packageName};\n\n`;
            }
            const imports = this.collectImports(options);
            if (imports.length > 0) {
                header += imports.join('\n') + '\n\n';
            }

            // Render separate boxes for each class
            this.renderClassBoxes(header, className);

            this.updateStats();
            document.getElementById('global-actions').classList.remove('hidden');
            this.showStatus('Conversion successful!', 'success');
        } catch (e) {
            this.showStatus('Error: ' + e.message, 'error');
        }
    }

    renderClassBoxes(header, mainClassName) {
        const container = document.getElementById('classes-container');
        container.innerHTML = '';

        // Render main class first, then nested classes
        const classNames = [mainClassName, ...Array.from(this.generatedClasses.keys()).filter(name => name !== mainClassName)];

        classNames.forEach((name, index) => {
            const classCode = this.generatedClasses.get(name);
            if (!classCode) return;

            const fullCode = index === 0 ? header + classCode : header + classCode;

            const box = document.createElement('div');
            box.className = 'class-box';
            box.innerHTML = `
                <div class="class-box-header">
                    <span class="class-name">${name}.java</span>
                    <div class="class-box-actions">
                        <button class="copy-btn" data-code="${this.escapeHtml(fullCode)}">Copy</button>
                        <button class="download-btn" data-code="${this.escapeHtml(fullCode)}" data-filename="${name}.java">Download</button>
                    </div>
                </div>
                <pre class="class-code"><code>${this.escapeHtml(fullCode)}</code></pre>
            `;
            container.appendChild(box);
        });

        // Bind copy/download buttons for new boxes
        this.bindClassBoxButtons();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    bindClassBoxButtons() {
        document.querySelectorAll('.class-box .copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.getAttribute('data-code');
                // Decode HTML entities
                const textarea = document.createElement('textarea');
                textarea.innerHTML = code;
                const decodedCode = textarea.value;

                navigator.clipboard.writeText(decodedCode)
                    .then(() => this.showStatus('Copied to clipboard!', 'success'))
                    .catch(() => this.showStatus('Failed to copy', 'error'));
            });
        });

        document.querySelectorAll('.class-box .download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.getAttribute('data-code');
                const filename = btn.getAttribute('data-filename');

                // Decode HTML entities
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
                this.showStatus(`Downloaded ${filename}!`, 'success');
            });
        });
    }

    getAllCode() {
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

    resetCounters() {
        this.classCount = 0;
        this.fieldCount = 0;
        this.annotationCount = 0;
    }

    getOptions() {
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

    collectImports(options) {
        const imports = [];

        // Lombok imports
        if (options.useData) imports.push('import lombok.Data;');
        if (options.useBuilder) imports.push('import lombok.Builder;');
        if (options.useNoArgs) imports.push('import lombok.NoArgsConstructor;');
        if (options.useAllArgs) imports.push('import lombok.AllArgsConstructor;');
        if (options.useGetter) imports.push('import lombok.Getter;');
        if (options.useSetter) imports.push('import lombok.Setter;');
        if (options.useToString) imports.push('import lombok.ToString;');
        if (options.useEquals) imports.push('import lombok.EqualsAndHashCode;');

        // Jackson imports
        if (options.useJackson) {
            imports.push('import com.fasterxml.jackson.annotation.JsonProperty;');
        }

        // Java imports
        imports.push('import java.util.List;');
        imports.push('import java.util.ArrayList;');

        return imports.sort();
    }

    generatePojo(className, jsonObj, options) {
        this.classCount++;
        let code = '';

        // Class annotations (no indent - each class is in separate box)
        const annotations = this.generateClassAnnotations(options);
        annotations.forEach(ann => {
            code += ann + '\n';
            this.annotationCount++;
        });

        // Class declaration
        code += `public class ${this.toPascalCase(className)} {\n\n`;

        // Fields
        const fields = [];
        if (Array.isArray(jsonObj)) {
            // If root is array, analyze first element
            if (jsonObj.length > 0 && typeof jsonObj[0] === 'object') {
                Object.keys(jsonObj[0]).forEach(key => {
                    fields.push(this.generateField(key, jsonObj[0][key], options, className));
                });
            }
        } else if (typeof jsonObj === 'object' && jsonObj !== null) {
            Object.keys(jsonObj).forEach(key => {
                fields.push(this.generateField(key, jsonObj[key], options, className));
            });
        }

        code += fields.join('\n\n');
        code += '\n}';

        this.generatedClasses.set(className, code);
        return code;
    }

    generateClassAnnotations(options) {
        const annotations = [];

        if (options.useData) annotations.push('@Data');
        if (options.useBuilder) annotations.push('@Builder');
        if (options.useNoArgs) annotations.push('@NoArgsConstructor');
        if (options.useAllArgs) annotations.push('@AllArgsConstructor');
        if (options.useGetter) annotations.push('@Getter');
        if (options.useSetter) annotations.push('@Setter');
        if (options.useToString) annotations.push('@ToString');
        if (options.useEquals) annotations.push('@EqualsAndHashCode');

        return annotations;
    }

    generateField(key, value, options, parentClassName) {
        this.fieldCount++;
        let code = '';
        const fieldName = this.toCamelCase(key);
        const javaType = this.getJavaType(key, value, options, parentClassName);
        const indent = '    '; // 4 spaces for field indentation

        // Jackson annotation
        if (options.useJackson && key !== fieldName) {
            code += indent + `@JsonProperty("${key}")\n`;
            this.annotationCount++;
        }

        // Builder.Default logic
        let addBuilderDefault = false;
        let defaultValue = null;
        if (options.useBuilder) {
            // Only for primitive/wrapper/boolean/List
            const type = typeof value;
            if (type === 'number') {
                addBuilderDefault = true;
                // Tentukan default value sesuai tipe Java
                if (javaType === 'double' || javaType === 'Double') {
                    defaultValue = '0D';
                } else if (javaType === 'float' || javaType === 'Float') {
                    defaultValue = '0F';
                } else if (javaType === 'long' || javaType === 'Long') {
                    defaultValue = '0L';
                } else if (javaType === 'short' || javaType === 'Short') {
                    defaultValue = '0';
                } else if (javaType === 'byte' || javaType === 'Byte') {
                    defaultValue = '0';
                } else { // int, Integer, default
                    defaultValue = '0';
                }
            } else if (type === 'boolean') {
                addBuilderDefault = true;
                defaultValue = 'false';
            } else if (Array.isArray(value)) {
                addBuilderDefault = true;
                defaultValue = 'new ArrayList<>()';
            }
        }

        if (addBuilderDefault) {
            code += indent + '@Builder.Default\n';
            this.annotationCount++;
        }

        // Field declaration
        const visibility = options.usePrivate ? 'private' : 'public';
        code += indent + `${visibility} ${javaType} ${fieldName}`;
        if (addBuilderDefault && defaultValue !== null) {
            code += ` = ${defaultValue}`;
        }
        code += ';';

        return code;
    }

    getJavaType(key, value, options, parentClassName) {
        if (value === null) {
            return 'Object';
        }

        const type = typeof value;

        switch (type) {
            case 'string':
                return 'String';
            case 'number':
                if (Number.isInteger(value)) {
                    if (options.usePrimitives) {
                        return value > 2147483647 || value < -2147483648 ? 'long' : 'int';
                    }
                    return value > 2147483647 || value < -2147483648 ? 'Long' : 'Integer';
                }
                return options.usePrimitives ? 'double' : 'Double';
            case 'boolean':
                return options.usePrimitives ? 'boolean' : 'Boolean';
            case 'object':
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        const elementType = this.getJavaType(key, value[0], options, parentClassName);
                        // If it's a nested object, generate a class for it
                        if (typeof value[0] === 'object' && !Array.isArray(value[0]) && value[0] !== null) {
                            const nestedClassName = this.toPascalCase(this.singularize(key));
                            if (!this.generatedClasses.has(nestedClassName)) {
                                this.generatePojo(nestedClassName, value[0], options);
                            }
                            return `List<${nestedClassName}>`;
                        }
                        return `List<${elementType}>`;
                    }
                    return 'List<Object>';
                } else {
                    // Nested object - generate a class for it
                    const nestedClassName = this.toPascalCase(key);
                    if (!this.generatedClasses.has(nestedClassName)) {
                        this.generatePojo(nestedClassName, value, options);
                    }
                    return nestedClassName;
                }
            default:
                return 'Object';
        }
    }

    // ==================== Utility Functions ====================
    toCamelCase(str) {
        // Handle snake_case and kebab-case
        return str
            .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
            .replace(/^./, char => char.toLowerCase());
    }

    toPascalCase(str) {
        // Handle snake_case and kebab-case
        const camelCase = this.toCamelCase(str);
        return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    }

    singularize(str) {
        // Simple singularization
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

    updateStats() {
        document.getElementById('stats').classList.remove('hidden');
        document.getElementById('class-count').textContent = this.classCount;
        document.getElementById('field-count').textContent = this.fieldCount;
        document.getElementById('annotation-count').textContent = this.annotationCount;
    }

    showStatus(message, type) {
        const statusEl = document.getElementById('status');
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.classList.remove('hidden');

        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 3000);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new JsonToPojoConverter();
});
