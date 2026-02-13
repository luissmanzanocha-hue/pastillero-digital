/**
 * Validation utilities for form inputs
 */

/**
 * Sanitize string input
 * @param {string} input - Raw input string
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input) => {
    if (!input || typeof input !== 'string') return '';
    return input.trim();
};

/**
 * Validate medication form data
 * @param {Object} formData - Medication form data
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateMedicationForm = (formData) => {
    const errors = [];

    // Required fields
    if (!formData.name || !sanitizeString(formData.name)) {
        errors.push('El nombre del medicamento es requerido');
    }

    if (!formData.dosagePattern || !sanitizeString(formData.dosagePattern)) {
        errors.push('El patrón de dosis es requerido');
    } else {
        // Validate dosage pattern format
        const patternRegex = /^\d+(\.\d+)?(-\d+(\.\d+)?){3}$/;
        if (!patternRegex.test(formData.dosagePattern)) {
            errors.push('El patrón de dosis debe tener el formato: número-número-número-número (ej: 1-0-0-0)');
        }
    }

    // Validate based on dose type
    if (formData.doseType === 'dosage') {
        if (!formData.doseAmount || parseFloat(formData.doseAmount) <= 0) {
            errors.push('La dosis en mg debe ser mayor a 0');
        }
    } else if (formData.doseType === 'fraction') {
        const validFractions = ['0.25', '0.5', '0.75', '1'];
        if (!validFractions.includes(formData.pillFraction)) {
            errors.push('La fracción de pastilla debe ser 1/4, 1/2, 3/4 o 1');
        }
    }

    // Validate treatment days
    if (!formData.treatmentDays || parseInt(formData.treatmentDays) <= 0) {
        errors.push('Los días de tratamiento deben ser mayor a 0');
    }

    // Validate start date
    if (!formData.startDate) {
        errors.push('La fecha de inicio es requerida');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate resident form data
 * @param {Object} formData - Resident form data
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateResidentForm = (formData) => {
    const errors = [];

    if (!formData.name || !sanitizeString(formData.name)) {
        errors.push('El nombre del residente es requerido');
    }

    if (formData.age && (parseInt(formData.age) < 0 || parseInt(formData.age) > 150)) {
        errors.push('La edad debe estar entre 0 y 150 años');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate stock amount
 * @param {number} stock - Stock amount
 * @returns {boolean} True if valid
 */
export const validateStock = (stock) => {
    const num = parseFloat(stock);
    return !isNaN(num) && num >= 0;
};
