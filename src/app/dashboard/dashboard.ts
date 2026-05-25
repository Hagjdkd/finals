import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  userName = '';

  total = 0;
  pending = 0;
  progress = 0;
  resolved = 0;

   // NEW
  resolution?: string;
  proofImage?: string;
  updatedAt?: string;
  complaints: any[] = [];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUser();
      this.loadComplaints();
    }
  }

  loadUser() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.userName = user.fullName || 'User';
  }

  loadComplaints() {

  const stored = JSON.parse(localStorage.getItem('complaints') || '[]');
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

   // STAFF REDIRECT
      if (
        user.role &&
        user.role.toLowerCase() === 'staff'
      ) {

        this.router.navigate(['/staff']);
        return;

      }

  if (!user.email) return;

  this.complaints = stored
    .map((c: any) => ({
      ...c,
      email: c.email || c.userEmail // ✅ normalize
    }))
    .filter((c: any) => c.email === user.email);

  this.total = this.complaints.length;

  this.pending = this.complaints.filter(
    c => c.status === 'Pending'
  ).length;

  this.progress = this.complaints.filter(
    c => c.status === 'In Progress'
  ).length;

  this.resolved = this.complaints.filter(
    c => c.status === 'Resolved'
  ).length;

  console.log('Dashboard complaints:', this.complaints);
}
}