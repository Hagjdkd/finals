// =========================
// 🔐 AUTH MODELS & INTERFACES
// =========================

/**
 * User Roles for Role-Based Access Control
 */
export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  CLIENT = 'client'
}

/**
 * Verification Status Enum
 */
export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed'
}

/**
 * Extended User Model with Authentication & Security Features
 */
export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  password: string; // Should be hashed
  mobileNumber: string;
  role: UserRole;
  
  // Email Verification
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationStatus: VerificationStatus;
  
  // Mobile Verification
  mobileVerified: boolean;
  mobileVerificationToken?: string;
  mobileVerificationOtp?: string;
  mobileVerificationStatus: VerificationStatus;
  
  // Passkey Authentication
  passkeyId?: string;
  passkeyPublicKey?: string;
  passkeyEnabled: boolean;
  
  // Session Management
  lastLogin?: Date;
  sessionToken?: string;
  sessionExpiresAt?: Date;
  isActive: boolean;
  
  // Account Security
  passwordResetToken?: string;
  passwordResetExpiresAt?: Date;
  loginAttempts: number;
  isLocked: boolean;
  lockedUntil?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  address?: string;
}

/**
 * Login Request/Response Models
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  sessionToken?: string;
  expiresIn?: number; // in seconds
}

/**
 * Registration Request Model
 */
export interface RegistrationRequest {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  address?: string;
  role?: UserRole;
}

/**
 * Passkey Model
 */
export interface Passkey {
  id: string;
  userId: number;
  publicKey: string;
  createdAt: Date;
  lastUsed?: Date;
}

/**
 * Verification Request/Response
 */
export interface VerificationRequest {
  type: 'email' | 'mobile';
  token: string;
  code?: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  verified: boolean;
}

/**
 * Password Reset Request
 */
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Session Token Payload
 */
export interface SessionTokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Auth State
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;
}
