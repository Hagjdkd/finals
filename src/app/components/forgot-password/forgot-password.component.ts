import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { emailValidator } from '../../utils/validators';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="form-wrapper">
        <h2>Forgot Password?</h2>
        <p class="subtitle">Enter your email to receive password reset instructions</p>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" *ngIf="!submitted">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="Enter your email"
              class="form-control"
            />
            <div class="error-message" *ngIf="isFieldInvalid('email')">
              <small *ngIf="forgotForm.get('email')?.hasError('required')">
                Email is required
              </small>
              <small *ngIf="forgotForm.get('email')?.hasError('invalidEmail')">
                Please enter a valid email
              </small>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="!forgotForm.valid || isLoading"
          >
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>

        <div class="success-message" *ngIf="submitted">
          <p>If an account exists with this email, you will receive a password reset link.</p>
          <p class="small-text">Please check your email and spam folder.</p>
          <button class="btn btn-secondary" (click)="goToLogin()">
            Back to Login
          </button>
        </div>

        <div class="error-message" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="links">
          <a routerLink="/login">Back to Login</a>
          <a routerLink="/register">Create Account</a>
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
      margin-top: 20px;
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

    .links {
      display: flex;
      justify-content: space-between;
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
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, emailValidator()]]
    });
  }

  onSubmit(): void {
    if (!this.forgotForm.valid) return;

    this.isLoading = true;
    const email = this.forgotForm.get('email')?.value;

    const result = this.authService.forgotPassword({ email });

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
    const field = this.forgotForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
