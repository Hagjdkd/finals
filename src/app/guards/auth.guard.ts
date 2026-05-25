import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {

    // ✅ Prevent SSR crash
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (!user.email) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}