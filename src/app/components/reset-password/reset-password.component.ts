import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { passwordStrengthValidator, passwordMatchValidator } from '../../utils/validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="form-wrapper">
        <h2>Reset Password</h2>
        <p class="subtitle">Enter your new password</p>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" *ngIf="!submitted">
          <div class="form-group">
            <label for="password">New Password</label>
            <input
              type="password"
              id="password"
              formControlName="newPassword"
              placeholder="Enter new password"
              class="form-control"
            />
            <div class="error-message" *ngIf="isFieldInvalid('newPassword')">
              <small *ngIf="resetForm.get('newPassword')?.hasError('required')">
                Password is required
              </small>
              <small *ngIf="resetForm.get('newPassword')?.hasError('minLength')">
                Password must be at least 8 characters
              </small>
              <small *ngIf="resetForm.get('newPassword')?.hasError('noUppercase')">
                Add uppercase letters (A-Z)
              </small>
              <small *ngIf="resetForm.get('newPassword')?.hasError('noLowercase')">
                Add lowercase letters (a-z)
              </small>
              <small *ngIf="resetForm.get('newPassword')?.hasError('noNumber')">
                Add numbers (0-9)
              </small>
              <small *ngIf="resetForm.get('newPassword')?.hasError('noSpecialChar')">
                Add special characters (!@#$%^&*)
              </small>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
              placeholder="Confirm new password"
              class="form-control"
            />
            <div class="error-message" *ngIf="isFieldInvalid('confirmPassword')">
              <small *ngIf="resetForm.get('confirmPassword')?.hasError('required')">
                Please confirm your password
              </small>
              <small *ngIf="resetForm.hasError('passwordMismatch') && resetForm.get('confirmPassword')?.touched">
                Passwords do not match
              </small>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="!resetForm.valid || isLoading"
          >
            {{ isLoading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>

        <div class="success-message" *ngIf="submitted">
          <p>Your password has been reset successfully!</p>
          <p class="small-text">You can now login with your new password.</p>
          <button class="btn btn-secondary" (click)="goToLogin()">
            Go to Login
          </button>
        </div>

        <div class="error-message" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="links">
          <a routerLink="/login">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .form-wrapper {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      color: #333;
      margin-bottom: 10px;
      text-align: center;
    }

    .subtitle {
      color: #666;
      text-align: center;
      margin-bottom: 30px;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .error-message {
      color: #e74c3c;
      margin-top: 5px;
      font-size: 12px;
    }

    .error-message small {
      display: block;
      margin: 3px 0;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .success-message p {
      margin: 5px 0;
    }

    .small-text {
      font-size: 12px;
    }

    .btn {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      margin-top: 10px;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
      margin-top: 10px;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    .links {
      display: flex;
      justify-content: center;
      margin-top: 20px;
      font-size: 12px;
    }

    .links a {
      color: #667eea;
      text-decoration: none;
    }

    .links a:hover {
      text-decoration: underline;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  submitted = false;
  errorMessage = '';
  resetToken = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordMatchValidator('newPassword', 'confirmPassword') }
    );
  }

  ngOnInit(): void {
    // Get reset token from URL query params
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'];
      if (!this.resetToken) {
        this.errorMessage = 'Invalid reset link. Please try again.';
      }
    });
  }

  onSubmit(): void {
    if (!this.resetForm.valid || !this.resetToken) return;

    this.isLoading = true;
    const newPassword = this.resetForm.get('newPassword')?.value;
    const confirmPassword = this.resetForm.get('confirmPassword')?.value;

    const result = this.authService.resetPassword({
      token: this.resetToken,
      newPassword,
      confirmPassword
    });

    this.isLoading = false;

    if (result.success) {
      this.submitted = true;
    } else {
      this.errorMessage = result.message;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
