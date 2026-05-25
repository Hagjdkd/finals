import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-session-warning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="session-warning-overlay" *ngIf="showWarning">
      <div class="session-warning-modal">
        <div class="modal-header">
          <h3>Session Expiring Soon</h3>
          <button class="close-btn" (click)="dismiss()">×</button>
        </div>

        <div class="modal-body">
          <div class="warning-icon">⚠️</div>
          <p>Your session will expire in <strong>{{ timeRemaining }}</strong></p>
          <p class="warning-message">
            For security reasons, you will be logged out if there is no activity.
          </p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="logout()">
            Logout Now
          </button>
          <button class="btn btn-primary" (click)="extend()">
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .session-warning-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .session-warning-modal {
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 30px 20px;
      text-align: center;
    }

    .warning-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }

    .modal-body p {
      margin: 10px 0;
      color: #666;
    }

    .modal-body strong {
      color: #e74c3c;
      font-size: 18px;
    }

    .warning-message {
      font-size: 13px;
      color: #999;
    }

    .modal-footer {
      display: flex;
      gap: 10px;
      padding: 20px;
      border-top: 1px solid #eee;
    }

    .btn {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
    }

    .btn-secondary {
      background: #ecf0f1;
      color: #333;
    }

    .btn-secondary:hover {
      background: #d5dbdf;
    }
  `]
})
export class SessionWarningComponent implements OnInit, OnDestroy {
  showWarning = false;
  timeRemaining = '5m 0s';
  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.sessionService.sessionWarning$
      .pipe(takeUntil(this.destroy$))
      .subscribe((timeRemaining: number) => {
        // Show warning when 5 minutes or less remain
        this.showWarning = timeRemaining > 0 && timeRemaining < 5 * 60 * 1000;
        this.updateTimeDisplay(timeRemaining);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  extend(): void {
    this.sessionService.extendSession();
    this.showWarning = false;
  }

  logout(): void {
    this.authService.logout();
  }

  dismiss(): void {
    this.showWarning = false;
  }

  private updateTimeDisplay(ms: number): void {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    this.timeRemaining = `${minutes}m ${seconds}s`;
  }
}
