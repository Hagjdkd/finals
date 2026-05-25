import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * HTTP Interceptor for Session Management & Security Headers
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    // Add session token to request headers
    const sessionToken = this.authService.getSessionToken();
    if (sessionToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${sessionToken}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    }

    // Add security headers
    request = this.addSecurityHeaders(request);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Add security headers to request
   */
  private addSecurityHeaders(request: HttpRequest<any>): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      }
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      // Unauthorized - session expired or invalid
      this.authService.logout();
      this.router.navigate(['/login']);
    } else if (error.status === 403) {
      // Forbidden - insufficient permissions
      this.router.navigate(['/unauthorized']);
    } else if (error.status === 0) {
      // Network error
      console.error('Network error occurred', error);
    }
  }
}
