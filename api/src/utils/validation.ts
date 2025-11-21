/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Phone validation (international format)
 */
export function isValidPhone(phone: string): boolean {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Check if it's between 10 and 15 digits
    return digits.length >= 10 && digits.length <= 15;
}

/**
 * Password strength validation
 */
export interface PasswordStrength {
    isValid: boolean;
    score: number; // 0-5
    feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    // Minimum length check
    if (password.length < 8) {
        feedback.push('Password must be at least 8 characters long');
    } else {
        score++;
    }

    // Maximum length check
    if (password.length > 128) {
        feedback.push('Password must not exceed 128 characters');
        return { isValid: false, score: 0, feedback };
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
        score++;
    } else {
        feedback.push('Password should contain at least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
        score++;
    } else {
        feedback.push('Password should contain at least one lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
        score++;
    } else {
        feedback.push('Password should contain at least one number');
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score++;
    } else {
        feedback.push('Password should contain at least one special character');
    }

    // Check for common patterns
    const commonPatterns = [
        /^123456/,
        /^password/i,
        /^qwerty/i,
        /^abc123/i,
        /^111111/,
        /^admin/i,
    ];

    for (const pattern of commonPatterns) {
        if (pattern.test(password)) {
            feedback.push('Password contains common patterns and is too weak');
            score = Math.max(0, score - 2);
            break;
        }
    }

    const isValid = score >= 3 && password.length >= 8;

    return {
        isValid,
        score,
        feedback: feedback.length > 0 ? feedback : ['Password is strong'],
    };
}

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: any): any {
    if (typeof input === 'string') {
        return sanitizeString(input);
    }

    if (Array.isArray(input)) {
        return input.map(sanitizeInput);
    }

    if (typeof input === 'object' && input !== null) {
        const sanitized: any = {};
        for (const key in input) {
            sanitized[key] = sanitizeInput(input[key]);
        }
        return sanitized;
    }

    return input;
}

/**
 * Check for SQL injection patterns
 */
export function containsSQLInjection(input: string): boolean {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
        /(;|\-\-|\/\*|\*\/)/,
        /(\bOR\b.*=.*)/i,
        /(\bAND\b.*=.*)/i,
        /(UNION.*SELECT)/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate number range
 */
export function isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

/**
 * Validate file extension
 */
export function isAllowedFileExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Validate file size
 */
export function isValidFileSize(sizeInBytes: number, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return sizeInBytes <= maxSizeInBytes;
}

/**
 * Validate student number format
 */
export function isValidStudentNumber(studentNumber: string): boolean {
    // Example format: 2024-12345 (year-number)
    const studentNumberRegex = /^\d{4}-\d{5}$/;
    return studentNumberRegex.test(studentNumber);
}

/**
 * Validate postal code (flexible for international)
 */
export function isValidPostalCode(postalCode: string, country?: string): boolean {
    // Remove spaces and hyphens
    const cleaned = postalCode.replace(/[\s-]/g, '');

    if (country === 'US') {
        // US ZIP code: 12345 or 12345-6789
        return /^\d{5}(\d{4})?$/.test(cleaned);
    } else if (country === 'TR') {
        // Turkey postal code: 5 digits
        return /^\d{5}$/.test(cleaned);
    } else {
        // Generic: 3-10 alphanumeric characters
        return /^[A-Z0-9]{3,10}$/i.test(cleaned);
    }
}

/**
 * Validate GPA
 */
export function isValidGPA(gpa: number): boolean {
    return isInRange(gpa, 0, 4.0);
}

/**
 * Validate percentage
 */
export function isValidPercentage(percentage: number): boolean {
    return isInRange(percentage, 0, 100);
}

/**
 * Validate rating
 */
export function isValidRating(rating: number): boolean {
    return Number.isInteger(rating) && isInRange(rating, 1, 5);
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
    // Remove path separators and special characters
    return filename
        .replace(/[\/\\]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .substring(0, 255); // Limit length
}

/**
 * Validate and sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
    // Remove SQL injection patterns
    let sanitized = query.trim();

    // Remove special SQL characters
    sanitized = sanitized.replace(/[;'"\\]/g, '');

    // Limit length
    sanitized = sanitized.substring(0, 100);

    return sanitized;
}
