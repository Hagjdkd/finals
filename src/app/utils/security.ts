/**
 * Security & Authentication Utilities
 */

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate mobile number (Philippine format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  return /^09\d{9}$/.test(phone.replace(/\D/g, ''));
}

/**
 * Validate strong password
 */
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password)
  );
}

/**
 * Hash password using simple method
 * In production, use bcrypt or similar library
 */
export function hashPassword(password: string): string {
  return btoa(password);
}

/**
 * Compare password with hash
 */
export function comparePassword(plainPassword: string, hash: string): boolean {
  return btoa(plainPassword) === hash;
}

/**
 * Generate OTP
 */
export function generateOTP(length: number = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Mask email address for display
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.substring(0, 2) + '***' + localPart.substring(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone number for display
 */
export function maskPhoneNumber(phone: string): string {
  return phone.substring(0, 3) + '***' + phone.substring(phone.length - 4);
}

/**
 * Validate session token format
 */
export function isValidSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  try {
    const payload = JSON.parse(atob(token));
    return payload.userId && payload.expiresAt && Date.now() < payload.expiresAt;
  } catch {
    return false;
  }
}

/**
 * Extract user info from session token
 */
export function getUserFromToken(token: string): any {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

/**
 * Check if session is expired
 */
export function isSessionExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

/**
 * Get time remaining in session
 */
export function getTimeRemaining(expiresAt: Date): number {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now());
}

/**
 * Format time remaining as string
 */
export function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Check if password needs reset (e.g., older than 90 days)
 */
export function needsPasswordReset(lastPasswordChange: Date, daysThreshold: number = 90): boolean {
  const now = new Date();
  const lastChange = new Date(lastPasswordChange);
  const daysDiff = (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff > daysThreshold;
}

/**
 * Check for suspicious login activity
 */
export interface LoginActivity {
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

export function isSuspiciousActivity(
  currentActivity: LoginActivity,
  previousActivities: LoginActivity[],
  threshold: number = 3
): boolean {
  if (previousActivities.length === 0) return false;

  const differentLocations = new Set(
    previousActivities.map(a => a.ipAddress)
  ).size;

  return differentLocations >= threshold;
}

/**
 * Validate two-factor authentication setup
 */
export function isValidTwoFactorSetup(totpSecret: string, backupCodes: string[]): boolean {
  return !!(
    totpSecret && totpSecret.length > 0 &&
    Array.isArray(backupCodes) && backupCodes.length >= 5
  );
}

/**
 * Rate limiting check
 */
export class RateLimiter {
  private attempts: { [key: string]: number[] } = {};
  private readonly windowMs: number;
  private readonly maxAttempts: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxAttempts: number = 5) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
  }

  isLimited(key: string): boolean {
    const now = Date.now();
    if (!this.attempts[key]) {
      this.attempts[key] = [];
    }

    // Remove old attempts outside the window
    this.attempts[key] = this.attempts[key].filter(time => now - time < this.windowMs);

    if (this.attempts[key].length >= this.maxAttempts) {
      return true;
    }

    this.attempts[key].push(now);
    return false;
  }

  getRemainingAttempts(key: string): number {
    if (!this.attempts[key]) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - this.attempts[key].length);
  }

  reset(key: string): void {
    delete this.attempts[key];
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, serverToken: string): boolean {
  return (token === serverToken) && (token.length > 0);
}
