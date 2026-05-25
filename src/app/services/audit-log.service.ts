import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Audit Log Service
 * Tracks all authentication and security-related activities
 */

export interface AuditLog {
  id: number;
  userId: number;
  email: string;
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  private storageKey = 'auditLogs';
  private readonly MAX_LOGS = 10000; // Keep last 10000 logs

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Log authentication event
   */
  logAuthEvent(
    userId: number,
    email: string,
    action: string,
    status: 'success' | 'failure',
    details: string = ''
  ): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const log: AuditLog = {
      id: this.generateLogId(),
      userId,
      email,
      action,
      details,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      status,
      timestamp: new Date()
    };

    this.addLog(log);
  }

  /**
   * Get audit logs for a specific user
   */
  getUserLogs(userId: number, limit: number = 100): AuditLog[] {
    if (!isPlatformBrowser(this.platformId)) return [];

    const logs = this.getAllLogs();
    return logs
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get logs for specific action
   */
  getLogsByAction(action: string, limit: number = 100): AuditLog[] {
    if (!isPlatformBrowser(this.platformId)) return [];

    const logs = this.getAllLogs();
    return logs
      .filter(log => log.action === action)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get failed login attempts
   */
  getFailedLoginAttempts(email: string, hours: number = 24): AuditLog[] {
    if (!isPlatformBrowser(this.platformId)) return [];

    const logs = this.getAllLogs();
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return logs.filter(log =>
      log.email === email &&
      log.action === 'LOGIN_ATTEMPT' &&
      log.status === 'failure' &&
      new Date(log.timestamp) > cutoffTime
    );
  }

  /**
   * Get recent activity by user
   */
  getRecentActivity(userId: number, hours: number = 24): AuditLog[] {
    if (!isPlatformBrowser(this.platformId)) return [];

    const logs = this.getAllLogs();
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return logs
      .filter(log =>
        log.userId === userId &&
        new Date(log.timestamp) > cutoffTime
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get all audit logs (Admin only)
   */
  getAllAuditLogs(limit: number = 1000): AuditLog[] {
    if (!isPlatformBrowser(this.platformId)) return [];

    const logs = this.getAllLogs();
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Export audit logs as CSV
   */
  exportAsCSV(logs: AuditLog[]): string {
    const headers = ['ID', 'User ID', 'Email', 'Action', 'Details', 'Status', 'Timestamp'];
    const rows = logs.map(log => [
      log.id,
      log.userId,
      log.email,
      log.action,
      log.details,
      log.status,
      new Date(log.timestamp).toISOString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Clear old logs (keep only recent ones)
   */
  clearOldLogs(daysToKeep: number = 90): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const cutoffTime = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    let logs = this.getAllLogs();

    logs = logs.filter(log => new Date(log.timestamp) > cutoffTime);

    localStorage.setItem(this.storageKey, JSON.stringify(logs));
  }

  // =========================
  // 🔍 PRIVATE HELPER METHODS
  // =========================

  private getAllLogs(): AuditLog[] {
    if (isPlatformBrowser(this.platformId)) {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }
    return [];
  }

  private addLog(log: AuditLog): void {
    if (!isPlatformBrowser(this.platformId)) return;

    let logs = this.getAllLogs();

    // Keep only max logs
    if (logs.length >= this.MAX_LOGS) {
      logs = logs.slice(-this.MAX_LOGS + 1);
    }

    logs.push(log);
    localStorage.setItem(this.storageKey, JSON.stringify(logs));
  }

  private generateLogId(): number {
    const logs = this.getAllLogs();
    return logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
  }

  private getClientIP(): string {
    // In production, get from backend
    return 'Client IP';
  }
}
