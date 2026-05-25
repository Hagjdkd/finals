import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

/**
 * Session Management Service
 * Handles secure session management, timeout, and activity tracking
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private readonly IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute

  private sessionExpiresAt: number | null = null;
  private lastActivityTime: number = Date.now();
  private sessionWarningSubject = new BehaviorSubject<number>(0); // milliseconds until session expires
  private isIdleSubject = new BehaviorSubject<boolean>(false);

  public sessionWarning$ = this.sessionWarningSubject.asObservable();
  public isIdle$ = this.isIdleSubject.asObservable();

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeSession();
    this.startSessionMonitoring();
    this.setupActivityTracking();
  }

  // =========================
  // 🔄 INITIALIZATION
  // =========================

  private initializeSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user = this.authService.getCurrentUser();
      if (user && user.sessionExpiresAt) {
        this.sessionExpiresAt = new Date(user.sessionExpiresAt).getTime();
        this.lastActivityTime = Date.now();
      }
    }
  }

  // =========================
  // 👁️ SESSION MONITORING
  // =========================

  /**
   * Start monitoring session status
   */
  private startSessionMonitoring(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    interval(this.ACTIVITY_CHECK_INTERVAL)
      .pipe(
        startWith(0),
        switchMap(() => {
          this.checkSessionStatus();
          return [];
        })
      )
      .subscribe();
  }

  /**
   * Check session status and update warning
   */
  private checkSessionStatus(): void {
    if (!this.sessionExpiresAt) return;

    const now = Date.now();
    const timeRemaining = this.sessionExpiresAt - now;

    // Session expired
    if (timeRemaining <= 0) {
      this.authService.logout();
      return;
    }

    // Check for idle timeout
    if (now - this.lastActivityTime > this.IDLE_TIMEOUT) {
      this.isIdleSubject.next(true);
      this.authService.logout();
      return;
    }

    this.isIdleSubject.next(false);
    this.sessionWarningSubject.next(timeRemaining);
  }

  // =========================
  // 🖱️ ACTIVITY TRACKING
  // =========================

  /**
   * Setup activity tracking
   */
  private setupActivityTracking(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, () => this.recordActivity());
    });
  }

  /**
   * Record user activity
   */
  private recordActivity(): void {
    const now = Date.now();
    // Only update if some time has passed since last activity
    if (now - this.lastActivityTime > 60000) { // 1 minute
      this.lastActivityTime = now;
    }
  }

  // =========================
  // 🛡️ SESSION MANAGEMENT
  // =========================

  /**
   * Extend current session
   */
  extendSession(): boolean {
    if (!this.authService.isAuthenticated()) {
      return false;
    }

    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // Update session expiry
    this.sessionExpiresAt = Date.now() + this.SESSION_TIMEOUT;
    this.lastActivityTime = Date.now();
    this.isIdleSubject.next(false);

    return true;
  }

  /**
   * Get time remaining in session (in milliseconds)
   */
  getTimeRemaining(): number {
    if (!this.sessionExpiresAt) return 0;
    return Math.max(0, this.sessionExpiresAt - Date.now());
  }

  /**
   * Format time remaining as readable string
   */
  getFormattedTimeRemaining(): string {
    const ms = this.getTimeRemaining();
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Check if session is about to expire (within 5 minutes)
   */
  isSessionWarning(): boolean {
    return this.getTimeRemaining() < 5 * 60 * 1000;
  }

  /**
   * Check if user is idle
   */
  isIdle(): boolean {
    return this.isIdleSubject.value;
  }

  /**
   * End current session
   */
  endSession(): void {
    this.sessionExpiresAt = null;
    this.authService.logout();
  }

  /**
   * Validate session token
   */
  validateSession(): boolean {
    return this.authService.isAuthenticated() && this.getTimeRemaining() > 0;
  }
}
