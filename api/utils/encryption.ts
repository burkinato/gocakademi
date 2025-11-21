import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;

/**
 * Derive encryption key from password
 */
function deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Get encryption key from environment or generate one
 */
function getEncryptionKey(): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        console.warn('ENCRYPTION_KEY not set in environment. Using default (NOT SECURE FOR PRODUCTION)');
        return 'default-encryption-key-change-this-in-production';
    }
    return key;
}

/**
 * Encrypt sensitive data
 */
export function encrypt(text: string): string {
    try {
        const password = getEncryptionKey();
        const salt = crypto.randomBytes(SALT_LENGTH);
        const key = deriveKey(password, salt);
        const iv = crypto.randomBytes(IV_LENGTH);

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const tag = cipher.getAuthTag();

        // Combine salt + iv + tag + encrypted data
        const result = Buffer.concat([
            salt,
            iv,
            tag,
            Buffer.from(encrypted, 'hex')
        ]);

        return result.toString('base64');
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
    try {
        const password = getEncryptionKey();
        const buffer = Buffer.from(encryptedData, 'base64');

        // Extract components
        const salt = buffer.slice(0, SALT_LENGTH);
        const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const tag = buffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
        const encrypted = buffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

        const key = deriveKey(password, salt);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Hash sensitive data (one-way)
 */
export function hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate random token
 */
export function generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate secure random string
 */
export function generateSecureRandom(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomBytes = crypto.randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars[randomBytes[i] % chars.length];
    }

    return result;
}

/**
 * Encrypt object (converts to JSON first)
 */
export function encryptObject(obj: any): string {
    return encrypt(JSON.stringify(obj));
}

/**
 * Decrypt object (parses JSON after decryption)
 */
export function decryptObject<T = any>(encryptedData: string): T {
    const decrypted = decrypt(encryptedData);
    return JSON.parse(decrypted);
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars) {
        return '*'.repeat(data.length);
    }

    const masked = '*'.repeat(data.length - visibleChars);
    const visible = data.slice(-visibleChars);

    return masked + visible;
}

/**
 * Mask email address
 */
export function maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (!domain) return maskSensitiveData(email);

    const maskedUsername = username.length > 2
        ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
        : '*'.repeat(username.length);

    return `${maskedUsername}@${domain}`;
}

/**
 * Mask phone number
 */
export function maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '*'.repeat(phone.length);

    const lastFour = digits.slice(-4);
    const masked = '*'.repeat(digits.length - 4);

    return masked + lastFour;
}
