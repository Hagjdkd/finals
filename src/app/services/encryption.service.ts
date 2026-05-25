import { Injectable } from '@angular/core';

/**
 * Encryption Service
 * Handles basic encryption/decryption of sensitive data
 * In production, use proper cryptographic libraries
 */
@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  private readonly SECRET_KEY = 'complaint-app-secret-key-2026'; // Should be environment variable

  constructor() {}

  /**
   * Encrypt data using simple base64 encoding
   * In production, use proper encryption like TweetNaCl.js or crypto-js
   */
  encrypt(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      return btoa(jsonString);
    } catch (error) {
      console.error('Encryption error:', error);
      return '';
    }
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData: string): any {
    try {
      const jsonString = atob(encryptedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Hash data using simple method
   * In production, use bcrypt or similar
   */
  hash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Generate random token
   */
  generateToken(length: number = 32): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    strong: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password should be at least 8 characters long');
    }

    if (password.length >= 12) {
      score += 1;
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add uppercase letters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add lowercase letters');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add numbers');
    }

    if (/[!@#$%^&*]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add special characters (!@#$%^&*)');
    }

    return {
      strong: score >= 4,
      score,
      feedback
    };
  }
}
