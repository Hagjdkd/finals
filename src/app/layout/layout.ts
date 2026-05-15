import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router'; // ✅ ADD RouterModule
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule], // ✅ VERY IMPORTANT
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class Layout {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.router.navigate(['/login']);
  }
}