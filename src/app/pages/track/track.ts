import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track.html',
  styleUrls: ['./track.css']
})
export class Track implements OnInit {

  trackingNumber: string = '';
  complaint: any = null;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // 🔥 Listen to route changes (better than snapshot)
    this.route.params.subscribe(params => {
      this.trackingNumber = params['id'];
      this.loadComplaint();
    });
  }

  // 🔍 LOAD COMPLAINT
  loadComplaint() {
  const data = JSON.parse(localStorage.getItem('complaints') || '[]');

  const found = data.find(
    (c: any) => c.trackingNumber === this.trackingNumber
  );

  if (found) {
    this.complaint = {
      ...found,
      fullName: found.fullName || found.name || 'Guest' // ✅ FIX
    };
    this.notFound = false;
  } else {
    this.complaint = null;
    this.notFound = true;
  }
}

  // 🔙 BACK TO HOME
  goHome() {
    this.router.navigate(['/']);
  }

  // 🔄 RETRY SEARCH (optional UX)
  retry() {
    this.notFound = false;
  }

  goBack() {
  window.history.back(); // simple and effective
}
}