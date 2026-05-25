import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

/**
 * Email & Mobile Verification Service
 * Handles verification token generation and validation
 */
@Injectable({
  providedIn: 'root'
})
export class VerificationService {

  private verificationCodeSubject = new BehaviorSubject<{ [key: string]: string }>({});
  public verificationCodes$ = this.verificationCodeSubject.asObservable();

  private readonly VERIFICATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  private verificationExpiry: { [key: string]: number } = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // =========================
  // 📧 EMAIL VERIFICATION
  // =========================

  /**
   * Generate email verification link
   */
  generateEmailVerificationLink(email: string, token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/verify-email?token=${token}`;
  }

  /**
   * Send email verification (mock - in production use real email service)
   */
  sendEmailVerification(email: string, verificationToken: string): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const link = this.generateEmailVerificationLink(email, verificationToken);
    console.log(`Email verification link sent to ${email}: ${link}`);

    // Store verification code
    const codes = this.verificationCodeSubject.value;
    codes[email] = verificationToken;
    this.verificationCodeSubject.next(codes);

    // Set expiry
    this.verificationExpiry[email] = Date.now() + this.VERIFICATION_TIMEOUT;

    return true;
  }

  /**
   * Verify email token
   */
  verifyEmailToken(email: string, token: string): boolean {
    const codes = this.verificationCodeSubject.value;
    const expiry = this.verificationExpiry[email];

    if (!codes[email] || codes[email] !== token) {
      return false;
    }

    if (expiry && Date.now() > expiry) {
      return false;
    }

    return true;
  }

  // =========================
  // 📱 MOBILE VERIFICATION
  // =========================

  /**
   * Generate OTP for mobile verification
   */
  generateOTP(length: number = 6): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  /**
   * Send OTP to mobile (mock - in production use SMS service)
   */
  sendOTPToMobile(mobileNumber: string, otp: string): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    console.log(`OTP sent to ${mobileNumber}: ${otp}`);

    // Store OTP
    const codes = this.verificationCodeSubject.value;
    codes[mobileNumber] = otp;
    this.verificationCodeSubject.next(codes);

    // Set expiry (5 minutes for OTP)
    this.verificationExpiry[mobileNumber] = Date.now() + 5 * 60 * 1000;

    return true;
  }

  /**
   * Verify OTP
   */
  verifyOTP(mobileNumber: string, otp: string, maxAttempts: number = 3): boolean {
    const codes = this.verificationCodeSubject.value;
    const expiry = this.verificationExpiry[mobileNumber];

    if (!codes[mobileNumber] || codes[mobileNumber] !== otp) {
      return false;
    }

    if (expiry && Date.now() > expiry) {
      return false;
    }

    return true;
  }

  /**
   * Resend OTP
   */
  resendOTP(mobileNumber: string): { success: boolean; message: string; otp?: string } {
    const expiry = this.verificationExpiry[mobileNumber];
    const now = Date.now();

    // Check if OTP was already sent recently (allow resend after 30 seconds)
    if (expiry && now < expiry - (4 * 60 * 1000)) {
      const waitTime = Math.ceil(((expiry - (4 * 60 * 1000)) - now) / 1000);
      return {
        success: false,
        message: `Please wait ${waitTime} seconds before requesting a new OTP`
      };
    }

    const newOtp = this.generateOTP();
    this.sendOTPToMobile(mobileNumber, newOtp);

    return {
      success: true,
      message: 'OTP resent successfully',
      otp: newOtp
    };
  }

  // =========================
  // 🔑 VERIFICATION TOKENS
  // =========================

  /**
   * Generate verification token
   */
  generateVerificationToken(length: number = 32): string {
    let token = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
  }

  /**
   * Clear verification codes for an email/mobile
   */
  clearVerification(identifier: string): void {
    const codes = this.verificationCodeSubject.value;
    delete codes[identifier];
    this.verificationCodeSubject.next(codes);
    delete this.verificationExpiry[identifier];
  }

  /**
   * Get verification status
   */
  getVerificationStatus(identifier: string): {
    exists: boolean;
    expired: boolean;
    timeRemaining: number;
  } {
    const codes = this.verificationCodeSubject.value;
    const expiry = this.verificationExpiry[identifier];
    const now = Date.now();

    return {
      exists: !!codes[identifier],
      expired: expiry ? now > expiry : true,
      timeRemaining: expiry ? Math.max(0, expiry - now) : 0
    };
  }
}
