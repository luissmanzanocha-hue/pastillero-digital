/**
 * Date helper utilities
 */

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale string (default 'es-MX')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'es-MX') => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Format date for input field
 * @param {Date|string} date - Date to format
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
};

/**
 * Get relative time string
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = d - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Vencido';
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays < 7) return `En ${diffDays} días`;
    if (diffDays < 30) return `En ${Math.floor(diffDays / 7)} semanas`;
    return `En ${Math.floor(diffDays / 30)} meses`;
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return d.toDateString() === today.toDateString();
};

/**
 * Add days to a date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};
/**
 * Get day name
 * @param {Date|string} date 
 * @returns {string} Day name
 */
export const getDayName = (date, locale = 'es-MX') => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, { weekday: 'long' });
};

/**
 * Get formatted date (Day Month)
 * @param {Date|string} date 
 * @returns {string}
 */
export const getFormattedDate = (date, locale = 'es-MX') => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
};
