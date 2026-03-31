/**
 * POJO generation logic for JSON to POJO Converter
 */

/**
 * Generate POJO classes from JSON object
 * @param {string} className - Main class name
 * @param {Object} jsonObj - JSON object to convert
 * @param {Object} options - Conversion options
 * @param {Map} generatedClasses - Map to store generated classes
 * @param {Map} classUsedTypes - Map to track used types per class
 * @param {Object} counters - Object to track counts
 * @returns {string} Generated POJO code
 */
function generatePojo(className, jsonObj, options, generatedClasses, classUsedTypes, counters) {
    counters.classCount++;
    let code = '';
    const usedTypes = new Set();

    // Class annotations
    const annotations = generateClassAnnotations(options);
    annotations.forEach(ann => {
        code += ann + '\n';
        counters.annotationCount++;
    });

    // Class declaration
    code += `public class ${toPascalCase(className)} {\n\n`;

    // Fields
    const fields = [];
    if (Array.isArray(jsonObj)) {
        // If root is array, analyze first element
        if (jsonObj.length > 0 && typeof jsonObj[0] === 'object') {
            Object.keys(jsonObj[0]).forEach(key => {
                fields.push(generateField(key, jsonObj[0][key], options, className, usedTypes, generatedClasses, classUsedTypes, counters));
            });
        }
    } else if (typeof jsonObj === 'object' && jsonObj !== null) {
        Object.keys(jsonObj).forEach(key => {
            fields.push(generateField(key, jsonObj[key], options, className, usedTypes, generatedClasses, classUsedTypes, counters));
        });
    }

    code += fields.join('\n\n');
    code += '\n}';

    generatedClasses.set(className, code);
    classUsedTypes.set(className, usedTypes);
    return code;
}

/**
 * Generate class annotations based on options
 * @param {Object} options - Conversion options
 * @returns {string[]} Array of annotation strings
 */
function generateClassAnnotations(options) {
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

/**
 * Generate field declaration
 * @param {string} key - Field key
 * @param {*} value - Field value
 * @param {Object} options - Conversion options
 * @param {string} parentClassName - Parent class name
 * @param {Set} usedTypes - Set to track used types
 * @param {Map} generatedClasses - Map to store generated classes
 * @param {Map} classUsedTypes - Map to track used types per class
 * @param {Object} counters - Object to track counts
 * @returns {string} Generated field code
 */
function generateField(key, value, options, parentClassName, usedTypes, generatedClasses, classUsedTypes, counters) {
    counters.fieldCount++;
    let code = '';
    const fieldName = toCamelCase(key);
    const javaType = getJavaType(key, value, options, parentClassName, usedTypes, generatedClasses, classUsedTypes, counters);
    const indent = '    ';

    // Track used types for imports
    if (javaType.startsWith('List<')) usedTypes.add('List');
    if (javaType === 'ArrayList' || javaType === 'new ArrayList<>()') usedTypes.add('ArrayList');
    if (javaType === 'LocalDate') usedTypes.add('LocalDate');
    if (javaType === 'LocalDateTime') usedTypes.add('LocalDateTime');
    if (javaType === 'Instant') usedTypes.add('Instant');

    // Jackson annotation
    if (options.useJackson && key !== fieldName) {
        code += indent + `@JsonProperty("${key}")\n`;
        counters.annotationCount++;
        usedTypes.add('JsonProperty');
    }

    // Builder.Default logic
    let addBuilderDefault = false;
    let defaultValue = null;
    if (options.useBuilder) {
        const type = typeof value;
        if (type === 'number') {
            addBuilderDefault = true;
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
            } else {
                defaultValue = '0';
            }
        } else if (type === 'boolean') {
            addBuilderDefault = true;
            defaultValue = 'false';
        } else if (Array.isArray(value)) {
            addBuilderDefault = true;
            defaultValue = 'new ArrayList<>()';
            usedTypes.add('ArrayList');
        }
    }

    if (addBuilderDefault) {
        code += indent + '@Builder.Default\n';
        counters.annotationCount++;
        usedTypes.add('Builder');
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

/**
 * Get Java type for a value
 * @param {string} key - Field key
 * @param {*} value - Field value
 * @param {Object} options - Conversion options
 * @param {string} parentClassName - Parent class name
 * @param {Set} usedTypes - Set to track used types
 * @param {Map} generatedClasses - Map to store generated classes
 * @param {Map} classUsedTypes - Map to track used types per class
 * @param {Object} counters - Object to track counts
 * @returns {string} Java type string
 */
function getJavaType(key, value, options, parentClassName, usedTypes, generatedClasses, classUsedTypes, counters) {
    if (value === null) {
        return 'Object';
    }

    const type = typeof value;

    // Date/time detection patterns
    const localDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    const localDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
    const instantPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?([Zz]|[+-]\d{2}:?\d{2})$/;

    switch (type) {
        case 'string': {
            if (localDatePattern.test(value)) {
                usedTypes && usedTypes.add('LocalDate');
                return 'LocalDate';
            }
            if (localDateTimePattern.test(value)) {
                usedTypes && usedTypes.add('LocalDateTime');
                return 'LocalDateTime';
            }
            if (instantPattern.test(value)) {
                usedTypes && usedTypes.add('Instant');
                return 'Instant';
            }
            return 'String';
        }
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
                    const elementType = getJavaType(key, value[0], options, parentClassName, usedTypes, generatedClasses, classUsedTypes, counters);
                    if (typeof value[0] === 'object' && !Array.isArray(value[0]) && value[0] !== null) {
                        const nestedClassName = toPascalCase(singularize(key));
                        if (!generatedClasses.has(nestedClassName)) {
                            generatePojo(nestedClassName, value[0], options, generatedClasses, classUsedTypes, counters);
                        }
                        return `List<${nestedClassName}>`;
                    }
                    return `List<${elementType}>`;
                }
                return 'List<Object>';
            } else {
                const nestedClassName = toPascalCase(key);
                if (!generatedClasses.has(nestedClassName)) {
                    generatePojo(nestedClassName, value, options, generatedClasses, classUsedTypes, counters);
                }
                return nestedClassName;
            }
        default:
            return 'Object';
    }
}

/**
 * Collect imports based on options
 * @param {Object} options - Conversion options
 * @param {Object} flags - Java time usage flags
 * @returns {string[]} Array of import statements
 */
function collectImports(options, flags) {
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

    // Java time imports if needed
    if (flags.hasLocalDate) imports.push('import java.time.LocalDate;');
    if (flags.hasLocalDateTime) imports.push('import java.time.LocalDateTime;');
    if (flags.hasInstant) imports.push('import java.time.Instant;');

    return imports.sort();
}

/**
 * Get imports for used types
 * @param {Set} usedTypes - Set of used types
 * @param {Object} options - Conversion options
 * @returns {string[]} Array of import statements
 */
function getImportsForUsedTypes(usedTypes, options) {
    const imports = [];
    // Lombok
    if (options.useData) imports.push('import lombok.Data;');
    if (usedTypes.has('Builder')) imports.push('import lombok.Builder;');
    if (options.useNoArgs) imports.push('import lombok.NoArgsConstructor;');
    if (options.useAllArgs) imports.push('import lombok.AllArgsConstructor;');
    if (options.useGetter) imports.push('import lombok.Getter;');
    if (options.useSetter) imports.push('import lombok.Setter;');
    if (options.useToString) imports.push('import lombok.ToString;');
    if (options.useEquals) imports.push('import lombok.EqualsAndHashCode;');
    // Jackson
    if (usedTypes.has('JsonProperty')) imports.push('import com.fasterxml.jackson.annotation.JsonProperty;');
    // Java util
    if (usedTypes.has('List')) imports.push('import java.util.List;');
    if (usedTypes.has('ArrayList')) imports.push('import java.util.ArrayList;');
    // Java time
    if (usedTypes.has('LocalDate')) imports.push('import java.time.LocalDate;');
    if (usedTypes.has('LocalDateTime')) imports.push('import java.time.LocalDateTime;');
    if (usedTypes.has('Instant')) imports.push('import java.time.Instant;');
    return imports.sort();
}
