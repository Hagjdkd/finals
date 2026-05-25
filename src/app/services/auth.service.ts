import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegistrationRequest,
  VerificationRequest,
  VerificationResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  UserRole,
  VerificationStatus,
  AuthState
} from '../models/auth.model';

/**
 * Authentication Service
 * Handles user login, registration, verification, and session management
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    sessionToken: null,
    isLoading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();
  private storageKey = 'users';
  private sessionKey = 'sessionToken';
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeAuth();
  }

  // =========================
  // 🔄 INITIALIZATION
  // =========================

  /**
   * Initialize authentication state from session
   */
  private initializeAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      const sessionToken = localStorage.getItem(this.sessionKey);
      if (sessionToken) {
        const user = this.getUserFromToken(sessionToken);
        if (user && this.isSessionValid(user)) {
          this.updateAuthState({
            isAuthenticated: true,
            user,
            sessionToken
          });
        } else {
          this.logout();
        }
      }
    }
  }

  // =========================
  // 🔐 LOGIN
  // =========================

  /**
   * Login with email and password
   */
  login(request: LoginRequest): LoginResponse {
    if (!isPlatformBrowser(this.platformId)) {
      return { success: false, message: 'Platform not supported' };
    }

    this.updateAuthState({ isLoading: true, error: null });

    const users = this.getAllUsers();
    const user = users.find(u => u.email === request.email);

    if (!user) {
      this.updateAuthState({
        isLoading: false,
        error: 'User not found'
      });
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Check if account is locked
    if (user.isLocked && user.lockedUntil) {
      const now = new Date().getTime();
      if (now < new Date(user.lockedUntil).getTime()) {
        this.updateAuthState({
          isLoading: false,
          error: 'Account locked. Try again later'
        });
        return {
          success: false,
          message: 'Account is locked due to multiple failed attempts'
        };
      } else {
        // Unlock account
        user.isLocked = false;
        user.loginAttempts = 0;
        this.updateUser(user);
      }
    }

    // Verify password
    if (!this.verifyPassword(request.password, user.password)) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        user.isLocked = true;
        user.lockedUntil = new Date(Date.now() + this.LOCK_DURATION);
      }

      this.updateUser(user);

      this.updateAuthState({
        isLoading: false,
        error: 'Invalid email or password'
      });

      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Check if email and mobile are verified
    if (!user.emailVerified || !user.mobileVerified) {
      return {
        success: false,
        message: 'Please verify your email and mobile number before login'
      };
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lastLogin = new Date();

    // Generate session token
    const sessionToken = this.generateSessionToken(user);
    user.sessionToken = sessionToken;
    user.sessionExpiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);

    this.updateUser(user);
    localStorage.setItem(this.sessionKey, sessionToken);

    this.updateAuthState({
      isAuthenticated: true,
      user,
      sessionToken,
      isLoading: false
    });

    return {
      success: true,
      message: 'Login successful',
      user,
      sessionToken,
      expiresIn: this.SESSION_TIMEOUT / 1000
    };
  }

  // =========================
  // 📝 REGISTRATION
  // =========================

  /**
   * Register a new user
   */
  register(request: RegistrationRequest): { success: boolean; message: string; user?: AuthUser } {
    if (!isPlatformBrowser(this.platformId)) {
      return { success: false, message: 'Platform not supported' };
    }

    // Validate passwords match
    if (request.password !== request.confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }

    const users = this.getAllUsers();

    // Check if user already exists
    if (users.some(u => u.email === request.email)) {
      return { success: false, message: 'Email already registered' };
    }

    if (users.some(u => u.mobileNumber === request.mobileNumber)) {
      return { success: false, message: 'Mobile number already registered' };
    }

    // Create new user
    const newUser: AuthUser = {
      id: this.generateUserId(),
      fullName: request.fullName,
      email: request.email,
      mobileNumber: request.mobileNumber,
      password: this.hashPassword(request.password),
      role: request.role || UserRole.CLIENT,
      address: request.address,
      emailVerified: false,
      emailVerificationStatus: VerificationStatus.PENDING,
      mobileVerified: false,
      mobileVerificationStatus: VerificationStatus.PENDING,
      passkeyEnabled: false,
      isActive: true,
      loginAttempts: 0,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Generate verification tokens
    newUser.emailVerificationToken = this.generateVerificationToken();
    newUser.mobileVerificationToken = this.generateVerificationToken();
    newUser.mobileVerificationOtp = this.generateOTP();

    this.addUser(newUser);

    return {
      success: true,
      message: 'Registration successful. Please verify your email and mobile number.',
      user: newUser
    };
  }

  // =========================
  // ✉️ EMAIL VERIFICATION
  // =========================

  /**
   * Verify user email
   */
  verifyEmail(request: VerificationRequest): VerificationResponse {
    if (!isPlatformBrowser(this.platformId)) {
      return { success: false, message: 'Platform not supported', verified: false };
    }

    const users = this.getAllUsers();
    const user = users.find(u => u.emailVerificationToken === request.token);

    if (!user) {
      return {
        success: false,
        message: 'Invalid verification token',
        verified: false
      };
    }

    user.emailVerified = true;
    user.emailVerificationStatus = VerificationStatus.VERIFIED;
    user.emailVerificationToken = undefined;
    user.updatedAt = new Date();

    this.updateUser(user);

    return {
      success: true,
      message: 'Email verified successfully',
      verified: true
    };
  }

  // =========================
  // 📱 MOBILE VERIFICATION
  // =========================

  /**
   * Verify mobile number with OTP
   */
  verifyMobile(request: VerificationRequest): VerificationResponse {
    if (!isPlatformBrowser(this.platformId)) {
      return { success: false, message: 'Platform not supported', verified: false };
    }

    const users = this.getAllUsers();
    const user = users.find(u => u.mobileVerificationToken === request.token);

    if (!user) {
      return {
        success: false,
        message: 'Invalid verification token',
        verified: false
      };
    }

    if (user.mobileVerificationOtp !== request.code) {
      return {
        success: false,
        message: 'Invalid OTP',
        verified: false
      };
    }

    user.mobileVerified = true;
    user.mobileVerificationStatus = VerificationStatus.VERIFIED;
    user.mobileVerificationToken = undefined;
    user.mobileVerificationOtp = undefined;
    user.updatedAt = new Date();

    this.updateUser(user);

    return {
      success: true,
      message: 'Mobile number verified successfully',
      verified: true
    };
  }

  // =========================
  // 🔑 PASSKEY AUTHENTICATION
  // =========================

  /**
   * Enable passkey authentication for user
   */
  enablePasskey(userId: number, passkeyId: string, publicKey: string): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);

    if (!user) return false;

    user.passkeyEnabled = true;
    user.passkeyId = passkeyId;
    user.passkeyPublicKey = publicKey;
    user.updatedAt = new Date();

    this.updateUser(user);
    return true;
  }

  /**
   * Verify passkey login
   */
  verifyPasskeyLogin(email: string, passkeyId: string): LoginResponse {
    if (!isPlatformBrowser(this.platformId)) {
      return { success: false, message: 'Platform not supported' };
    }

    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.passkeyId === passkeyId);

    if (!user || !user.passkeyEnabled) {
      return {
        success: false,
        message: 'Passkey authentication failed'
      };
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.lastLogin = new Date();

    // Generate session token
    const sessionToken = this.generateSessionToken(user);
    user.sessionToken = sessionToken;
    user.sessionExpiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);

    this.updateUser(user);
    localStorage.setItem(this.sessionKey, sessionToken);

    this.updateAuthState({
      isAuthenticated: true,
      user,
      sessionToken
    });

    return {
      success: true,
      message: 'Passkey login successful',
      user,
      sessionToken,
      expiresIn: this.SESSION_TIMEOUT / 1000
    };
  }

  // =========================
  // 🔑 FORGOT PASSWORD
  // =========================

  /**
   * Initiate password reset
   */
  forgotPassword(request: PasswordResetRequest): { success: boolean; message: string } {
    if (!isPlatformBrowser(this.platformId)) {
      return { success: false, message: 'Platform not supported' };
    }

    const users = this.getAllUsers();
    const user = users.find(u => u.email === request.email);

    if (!user) {
      return {
        success: true,
        message: 'If this email exists, a password reset link has been sent'
      };
    }

    const resetToken = this.generateVerificationToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    this.updateUser(user);

    // In real app, send email with reset link
    console.log(`Password reset link: /reset-password?token=${resetToken}`);

    return {
      success: true,
      message: 'If this email exists, a password reset link has been sent'
    };
  }

  /**
   * Reset password with token
   */
  resetPassword(request: PasswordResetConfirm): { success: boolean; message: string } {
    if (!isPlatformBrowser(this.platformId)) {
      return { success: false, message: 'Platform not supported' };
    }

    if (request.newPassword !== request.confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }

    const users = this.getAllUsers();
    const user = users.find(u => u.passwordResetToken === request.token);

    if (!user || !user.passwordResetExpiresAt) {
      return { success: false, message: 'Invalid or expired reset token' };
    }

    if (new Date() > new Date(user.passwordResetExpiresAt)) {
      return { success: false, message: 'Reset token has expired' };
    }

    user.password = this.hashPassword(request.newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    user.updatedAt = new Date();

    this.updateUser(user);

    return {
      success: true,
      message: 'Password reset successful'
    };
  }

  // =========================
  // 🚪 LOGOUT
  // =========================

  /**
   * Logout current user
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.sessionKey);
    }

    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      sessionToken: null
    });
  }

  // =========================
  // 🛡️ PRIVATE HELPER METHODS
  // =========================

  private hashPassword(password: string): string {
    // In production, use bcrypt or similar
    // This is a simple hash for demo purposes
    return btoa(password);
  }

  private verifyPassword(plainPassword: string, hashedPassword: string): boolean {
    return btoa(plainPassword) === hashedPassword;
  }

  private generateSessionToken(user: AuthUser): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      issuedAt: Date.now(),
      expiresAt: Date.now() + this.SESSION_TIMEOUT
    };
    return btoa(JSON.stringify(payload));
  }

  private getUserFromToken(token: string): AuthUser | null {
    try {
      const payload = JSON.parse(atob(token));
      const users = this.getAllUsers();
      return users.find(u => u.id === payload.userId) || null;
    } catch {
      return null;
    }
  }

  private isSessionValid(user: AuthUser): boolean {
    if (!user.sessionExpiresAt) return false;
    return new Date() < new Date(user.sessionExpiresAt);
  }

  private generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateUserId(): number {
    const users = this.getAllUsers();
    return Math.max(0, ...users.map(u => u.id)) + 1;
  }

  private updateAuthState(state: Partial<AuthState>): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({ ...currentState, ...state });
  }

  // =========================
  // 💾 STORAGE OPERATIONS
  // =========================

  private getAllUsers(): AuthUser[] {
    if (isPlatformBrowser(this.platformId)) {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }
    return [];
  }

  private addUser(user: AuthUser): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const users = this.getAllUsers();
    users.push(user);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  private updateUser(user: AuthUser): void {
    if (!isPlatformBrowser(this.platformId)) return;
    let users = this.getAllUsers();
    users = users.map(u => u.id === user.id ? user : u);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  // =========================
  // 🔍 PUBLIC GETTER METHODS
  // =========================

  getCurrentUser(): AuthUser | null {
    return this.authStateSubject.value.user;
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  getSessionToken(): string | null {
    return this.authStateSubject.value.sessionToken;
  }
}
