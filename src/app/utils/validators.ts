import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

/**
 * Custom Validators for Authentication & Security
 */

/**
 * Email format validator
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(control.value);

    return isValid ? null : { invalidEmail: true };
  };
}

/**
 * Mobile number validator (supports various formats)
 */
export function mobileNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    // Philippine number format: 09XXXXXXXXX
    const phoneRegex = /^09\d{9}$/;
    const isValid = phoneRegex.test(control.value.replace(/\D/g, ''));

    return isValid ? null : { invalidMobileNumber: true };
  };
}

/**
 * Password strength validator
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const password = control.value;
    const errors: ValidationErrors = {};

    if (password.length < 8) {
      errors['minLength'] = true;
    }

    if (!/[A-Z]/.test(password)) {
      errors['noUppercase'] = true;
    }

    if (!/[a-z]/.test(password)) {
      errors['noLowercase'] = true;
    }

    if (!/[0-9]/.test(password)) {
      errors['noNumber'] = true;
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors['noSpecialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/**
 * Password confirmation validator
 */
export function passwordMatchValidator(passwordField: string, confirmPasswordField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField);
    const confirmPassword = control.get(confirmPasswordField);

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  };
}

/**
 * No spaces validator
 */
export function noSpacesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    return /\s/.test(control.value) ? { hasSpaces: true } : null;
  };
}

/**
 * Alphanumeric validator
 */
export function alphanumericValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    return /^[a-zA-Z0-9]+$/.test(control.value) ? null : { alphanumericOnly: true };
  };
}

/**
 * OTP validator (6 digits)
 */
export function otpValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    return /^\d{6}$/.test(control.value) ? null : { invalidOtp: true };
  };
}

/**
 * Username validator
 */
export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const username = control.value;

    if (username.length < 3) {
      return { minLength: true };
    }

    if (username.length > 20) {
      return { maxLength: true };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { invalidUsername: true };
    }

    return null;
  };
}

/**
 * URL validator
 */
export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    try {
      new URL(control.value);
      return null;
    } catch {
      return { invalidUrl: true };
    }
  };
}

/**
 * Strong password validator with multiple criteria
 */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const password = control.value;
    const errors: ValidationErrors = {};
    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

    // Require at least 4 types of characters
    if (strength < 4) {
      errors['weakPassword'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/**
 * Unique email validator (simulated - would be async in production)
 */
export function uniqueEmailValidator(existingEmails: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    return existingEmails.includes(control.value) ? { emailExists: true } : null;
  };
}

/**
 * Age validator (must be 18+)
 */
export function ageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 18 ? null : { underage: true };
  };
}

/**
 * NRIC/ID format validator
 */
export function nricValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    // Support various ID formats
    return /^\d{10,15}$/.test(control.value.replace(/\D/g, '')) ? null : { invalidNric: true };
  };
}
