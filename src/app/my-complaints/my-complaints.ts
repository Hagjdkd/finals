import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-complaints',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-complaints.html',
  styleUrls: ['./my-complaints.css']
})
export class MyComplaints implements OnInit {

  complaints: any[] = [];
  userName = '';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // ✅ Prevent SSR crash
    if (isPlatformBrowser(this.platformId)) {
      this.loadUser();
      this.loadMyComplaints();
    }
  }

  loadUser() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (!user.email) {
      alert('Session expired. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    this.userName = user.fullName || 'User';
  }

  loadMyComplaints() {
    const storedComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (!user.email) return;

    this.complaints = storedComplaints
      .map((c: any) => ({
        ...c,
        email: c.email || c.userEmail // ✅ normalize
      }))
      .filter((c: any) => c.email === user.email);

    console.log('My complaints:', this.complaints);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}