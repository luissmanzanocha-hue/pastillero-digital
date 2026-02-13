/**
 * Calculation utilities for medication management
 */

/**
 * Parse dosage pattern and calculate total daily doses
 * @param {string} pattern - Pattern like "1-0-0-0" or "1-0-1-0"
 * @returns {number} Total doses per day
 */
export const calculateDailyDoses = (pattern) => {
    if (!pattern || typeof pattern !== 'string') return 0;

    // Try hyphenated format first (e.g. 1-0-1)
    if (pattern.includes('-')) {
        const doses = pattern.split('-').map(d => parseFloat(d) || 0);
        return doses.reduce((sum, dose) => sum + dose, 0);
    }

    // Try to extract all numbers from string and sum them (e.g. "1 cada 8 horas")
    const matches = pattern.match(/(\d+(\.\d+)?)/g);
    if (matches) {
        return matches.reduce((acc, curr) => acc + parseFloat(curr), 0);
    }

    return 0;
};

/**
 * Calculate total pills needed for treatment
 * @param {number} dailyDoses - Number of doses per day
 * @param {number} treatmentDays - Duration of treatment in days
 * @param {number} pillFraction - Fraction of pill per dose (0.25, 0.5, 0.75, 1)
 * @returns {number} Total pills needed
 */
export const calculateTotalPills = (dailyDoses, treatmentDays, pillFraction = 1) => {
    const dailyPills = dailyDoses * pillFraction;
    return dailyPills * treatmentDays;
};

/**
 * Calculate daily pill usage
 * @param {number} dailyDoses - Number of doses per day
 * @param {number} pillFraction - Fraction of pill per dose
 * @returns {number} Pills used per day
 */
export const calculateDailyUsage = (dailyDoses, pillFraction = 1) => {
    return dailyDoses * pillFraction;
};

/**
 * Calculate remaining days based on current stock
 * @param {number} currentStock - Current number of pills in stock
 * @param {number} dailyUsage - Pills used per day
 * @returns {number} Days remaining (rounded down)
 */
export const calculateRemainingDays = (currentStock, dailyUsage) => {
    if (!dailyUsage || dailyUsage === 0) return 0;
    return Math.floor(currentStock / dailyUsage);
};

/**
 * Convert decimal to fraction string
 * @param {number} decimal - Decimal value (0.25, 0.5, 0.75, 1)
 * @returns {string} Fraction representation
 */
export const decimalToFraction = (decimal) => {
    const num = parseFloat(decimal);

    if (num === 0.25) return '1/4';
    if (num === 0.5) return '1/2';
    if (num === 0.75) return '3/4';
    if (num === 1) return '1';

    // For other values, try to find a simple fraction
    if (num < 1) {
        const denominator = Math.round(1 / num);
        return `1/${denominator}`;
    }

    return num.toString();
};

/**
 * Calculate end date of treatment
 * @param {string} startDate - Start date in ISO format
 * @param {number} treatmentDays - Duration in days
 * @returns {Date} End date
 */
export const calculateEndDate = (startDate, treatmentDays) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + parseInt(treatmentDays));
    return end;
};

/**
 * Check if medication is expiring soon
 * @param {Date} endDate - Treatment end date
 * @param {number} daysThreshold - Days threshold for warning (default 7)
 * @returns {boolean} True if expiring soon
 */
export const isExpiringSoon = (endDate, daysThreshold = 7) => {
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold && diffDays > 0;
};

/**
 * Check if medication has expired
 * @param {Date} endDate - Treatment end date
 * @returns {boolean} True if expired
 */
export const isExpired = (endDate) => {
    const today = new Date();
    return endDate < today;
};
