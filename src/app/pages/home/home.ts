import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {

  trackingNumber: string = '';
  errorMessage: string = '';

  complaintCount: number = 0;
  recentComplaints: any[] = [];

  testimonials: any[] = [];

  newTestimonial = {
    name: '',
    message: ''
  };

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Only access browser APIs on the client
    if (isPlatformBrowser(this.platformId)) {
      this.loadComplaints();
      this.loadTestimonials();
    }
  }

  // =========================
  // COMPLAINTS
  // =========================
  loadComplaints() {
    const data = JSON.parse(localStorage.getItem('complaints') || '[]');

    const formatted = data.map((c: any) => ({
      trackingNumber: c.trackingNumber || 'TRK-000000',
      status: this.formatStatus(c.status),
      date: c.date || new Date().toISOString()
    }));

    this.complaintCount = formatted.length;

    this.recentComplaints = formatted
      .sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);
  }

  formatStatus(status: string): string {
    if (!status) return 'Pending';

    const s = status.toLowerCase();

    if (s.includes('progress')) return 'In Progress';
    if (s.includes('resolve')) return 'Resolved';

    return 'Pending';
  }

  // =========================
  // TESTIMONIALS
  // =========================
  loadTestimonials() {
    this.testimonials = JSON.parse(localStorage.getItem('testimonials') || '[]');
  }

  addTestimonial() {
    if (!this.newTestimonial.name || !this.newTestimonial.message) return;

    const data = JSON.parse(localStorage.getItem('testimonials') || '[]');

    const newEntry = {
      name: this.newTestimonial.name,
      message: this.newTestimonial.message,
      date: new Date().toISOString()
    };

    data.unshift(newEntry);
    localStorage.setItem('testimonials', JSON.stringify(data));

    this.newTestimonial = { name: '', message: '' };
    this.loadTestimonials();
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString() + ' • ' +
           d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // =========================
  // NAVIGATION
  // =========================
  goToSubmit() {
    this.router.navigate(['/submit']);
  }

  // 🔥 FIXED + IMPROVED TRACK
  track() {
  let id = this.trackingNumber.trim().toUpperCase();

  console.log("Tracking input:", id); // 👈 DEBUG

  if (!id) {
    this.errorMessage = 'Enter tracking number';
    return;
  }

  if (!/^TRK-\d{6}$/.test(id)) {
    this.errorMessage = 'Format: TRK-123456';
    return;
  }

  this.errorMessage = '';

  console.log("Navigating to:", id); // 👈 DEBUG

  this.router.navigate(['/track', id]).then(success => {
    console.log("Navigation success:", success); // 👈 DEBUG
  });
}

  onEnter() {
    this.track();
  }

  formatInput() {
    let v = this.trackingNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!v.startsWith('TRK')) v = 'TRK' + v;

    if (v.length > 3) {
      v = v.slice(0, 3) + '-' + v.slice(3, 9);
    }

    this.trackingNumber = v;
  }

  // =========================
  // CAROUSEL
  // =========================
  scrollLeft() {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.querySelector('.steps-carousel');
    el?.scrollBy({ left: -320, behavior: 'smooth' });
  }

  scrollRight() {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.querySelector('.steps-carousel');
    el?.scrollBy({ left: 320, behavior: 'smooth' });
  }

  // 🔥 BONUS: click recent complaint → track
  goToTrack(id: string) {
    this.router.navigate(['/track', id]);
  }

  goToLogin() {
  this.router.navigate(['/login']);
}
}