import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionHexService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 12; // 96 bits for GCM
  private readonly saltLength = 16;
  private readonly tagLength = 16;
  private readonly encoding: BufferEncoding = 'hex';

  constructor() {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
  }

  /**
   * Encrypts a value using AES-256-GCM with salt
   */
  async encrypt(value: string): Promise<string> {
    try {
      // Generate salt and IV
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);

      // Derive key using PBKDF2
      const key = crypto.pbkdf2Sync(
        process.env.ENCRYPTION_KEY,
        salt,
        10000, // Reduced iterations for better performance while maintaining security
        this.keyLength,
        'sha256'
      );

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      // Encrypt the value
      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get auth tag
      const tag = cipher.getAuthTag();

      // Combine all components: salt + iv + tag + encrypted
      // Convert to hex strings and join with delimiters
      const result = [
        salt.toString('hex'),
        iv.toString('hex'),
        tag.toString('hex'),
        encrypted
      ].join(':');

      return result;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts a value using AES-256-GCM
   */
  async decrypt(encryptedValue: string): Promise<string> {
    try {
      // Split the components
      const [saltHex, ivHex, tagHex, encryptedHex] = encryptedValue.split(':');

      // Convert hex strings back to buffers
      const salt = Buffer.from(saltHex, 'hex');
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      
      // Derive key using PBKDF2 with same parameters
      const key = crypto.pbkdf2Sync(
        process.env.ENCRYPTION_KEY,
        salt,
        10000,
        this.keyLength,
        'sha256'
      );

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);

      // Decrypt the value
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generates a secure random key suitable for encryption
   */
  generateSecureKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }
}