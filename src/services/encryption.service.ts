import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 12;
  private readonly saltLength = 16;
  private readonly tagLength = 16;

  constructor() {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
  }

  async encrypt(value: string): Promise<string> {
    try {
      // Generate salt and IV
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);

      // Generate key from password using salt
      const key = crypto.pbkdf2Sync(
        process.env.ENCRYPTION_KEY,
        salt,
        10000,
        this.keyLength,
        'sha256'
      );

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      // Encrypt the data
      let encryptedData = cipher.update(value, 'utf8');
      encryptedData = Buffer.concat([encryptedData, cipher.final()]);

      // Get auth tag
      const tag = cipher.getAuthTag();

      // Combine all components in specific order
      const combined = Buffer.concat([
        salt,           // First 16 bytes
        iv,            // Next 12 bytes
        tag,           // Next 16 bytes
        encryptedData  // Remaining bytes
      ]);

      // Return as base64
      return combined.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  async decrypt(encryptedValue: string): Promise<string> {
    try {
      // Convert from base64 to buffer
      const combined = Buffer.from(encryptedValue, 'base64');

      // Extract components
      let offset = 0;
      const salt = combined.slice(offset, offset += this.saltLength);
      const iv = combined.slice(offset, offset += this.ivLength);
      const tag = combined.slice(offset, offset += this.tagLength);
      const encryptedData = combined.slice(offset);

      // Generate key from password using salt
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

      // Decrypt the data
      let decrypted = decipher.update(encryptedData);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  generateSecureKey(): string {
    return crypto.randomBytes(this.keyLength).toString('base64');
  }
}