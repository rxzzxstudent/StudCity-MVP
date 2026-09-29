import crypto from 'crypto';

// AES-256-GCM Encryption / Decryption Module
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer | null {
  const rawKey = process.env.ANALYTICS_ENCRYPTION_KEY;
  if (!rawKey) return null;

  // Support 64-char hex or 32-byte string
  if (rawKey.length === 64) {
    return Buffer.from(rawKey, 'hex');
  }
  // Hash with sha256 to ensure exact 32 bytes
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Encrypts plain text using AES-256-GCM.
 * Output format: iv:authTag:ciphertext (base64)
 */
export function encryptData(plainText: string): string {
  if (!plainText) return plainText;

  const key = getEncryptionKey();
  if (!key) {
    // If no key provided, return original text (graceful fallback)
    return plainText;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    return `enc:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('[Crypto Error] Encryption failed:', err);
    return plainText;
  }
}

/**
 * Decrypts AES-256-GCM encrypted string.
 */
export function decryptData(cipherText: string): string {
  if (!cipherText || !cipherText.startsWith('enc:')) {
    return cipherText;
  }

  const key = getEncryptionKey();
  if (!key) {
    return cipherText;
  }

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 4) return cipherText;

    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const encryptedHex = parts[3];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('[Crypto Error] Decryption failed:', err);
    return cipherText;
  }
}

/**
 * Helper to generate a secure random 32-byte (256-bit) hex key.
 */
export function generateRandomAesKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
