import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { AuditLogService } from '../services/audit-log.service';
import { AuthService } from '../services/auth.service';

/**
 * Logging Interceptor
 * Logs all HTTP requests and responses for audit trail
 */
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {

  constructor(
    private auditLogService: AuditLogService,
    private authService: AuthService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const user = this.authService.getCurrentUser();
    const startTime = Date.now();

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            const duration = Date.now() - startTime;
            this.logRequest(request, event.status, duration, user?.id || 0, user?.email || 'Unknown');
          }
        },
        (error: any) => {
          const duration = Date.now() - startTime;
          this.logRequest(request, error.status || 0, duration, user?.id || 0, user?.email || 'Unknown', true);
        }
      )
    );
  }

  private logRequest(
    request: HttpRequest<any>,
    status: number,
    duration: number,
    userId: number,
    email: string,
    isError: boolean = false
  ): void {
    const details = `${request.method} ${request.url} - ${status} - ${duration}ms`;

    // Only log sensitive operations
    if (this.isSensitiveOperation(request.url)) {
      this.auditLogService.logAuthEvent(
        userId,
        email,
        `HTTP_${request.method}`,
        isError ? 'failure' : 'success',
        details
      );
    }
  }

  private isSensitiveOperation(url: string): boolean {
    const sensitiveOperations = [
      '/api/auth',
      '/api/users',
      '/api/complaints',
      '/api/admin'
    ];

    return sensitiveOperations.some(op => url.includes(op));
  }
}
