/**
 * Validation utilities for sanitizing and validating user input
 * Safe, non-breaking additions to enforce data quality
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation (allows international formats)
const PHONE_REGEX = /^[\d\s\-+()]{7,}$/;

/**
 * Validate contact form data
 * @param {Object} data - Form data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateContactForm(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!data.email || !EMAIL_REGEX.test(data.email)) {
        errors.push('Valid email address is required');
    }

    if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 5) {
        errors.push('Message must be at least 5 characters');
    }

    if (data.phone && data.phone.length > 0 && !PHONE_REGEX.test(data.phone)) {
        errors.push('Phone number format is invalid');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate subcontractor form data
 * @param {Object} data - Form data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateSubcontractorForm(data) {
    const errors = [];

    if (!data.company || typeof data.company !== 'string' || data.company.trim().length < 2) {
        errors.push('Company name must be at least 2 characters');
    }

    if (!data.contact || typeof data.contact !== 'string' || data.contact.trim().length < 2) {
        errors.push('Contact name must be at least 2 characters');
    }

    if (!data.email || !EMAIL_REGEX.test(data.email)) {
        errors.push('Valid email address is required');
    }

    if (!data.trade || typeof data.trade !== 'string' || data.trade.trim().length < 2) {
        errors.push('Trade/specialty is required');
    }

    if (data.phone && data.phone.length > 0 && !PHONE_REGEX.test(data.phone)) {
        errors.push('Phone number format is invalid');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate quote request data
 * @param {Object} data - Form data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateQuoteRequest(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!data.email || !EMAIL_REGEX.test(data.email)) {
        errors.push('Valid email address is required');
    }

    if (!data.phone || !PHONE_REGEX.test(data.phone)) {
        errors.push('Valid phone number is required');
    }

    if (!data.projectType || typeof data.projectType !== 'string' || data.projectType.trim().length < 2) {
        errors.push('Project type is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate project creation/update data
 * @param {Object} data - Project data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateProjectData(data) {
    const errors = [];

    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
        errors.push('Project title must be at least 3 characters');
    }

    if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
        errors.push('Project description must be at least 10 characters');
    }

    if (!data.category || typeof data.category !== 'string' || data.category.trim().length < 2) {
        errors.push('Project category is required');
    }

    // Validate status if provided
    if (data.status && !['ongoing', 'completed'].includes(data.status.toLowerCase())) {
        errors.push('Status must be either "ongoing" or "completed"');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Sanitize string input (trim and basic XSS prevention)
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/[<>]/g, ''); // Remove < and > to prevent basic XSS
}

/**
 * Sanitize object fields
 * @param {Object} obj - Object to sanitize
 * @param {string[]} fields - Fields to sanitize
 * @returns {Object} - Sanitized object
 */
function sanitizeObject(obj, fields = []) {
    const sanitized = { ...obj };
    fields.forEach(field => {
        if (sanitized[field] && typeof sanitized[field] === 'string') {
            sanitized[field] = sanitizeString(sanitized[field]);
        }
    });
    return sanitized;
}

module.exports = {
    validateContactForm,
    validateSubcontractorForm,
    validateQuoteRequest,
    validateProjectData,
    sanitizeString,
    sanitizeObject
};
