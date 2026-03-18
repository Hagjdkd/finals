import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],  // ✅ ADD THIS
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})

export class Dashboard implements OnInit {

  userName = '';

  total = 0;
  pending = 0;
  progress = 0;
  resolved = 0;

  complaints: any[] = [];

  ngOnInit() {
    this.loadUser();
    this.loadComplaints();
  }

  loadUser() {
    const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    this.userName = user.fullName || 'User';
  }

  loadComplaints() {

    const storedComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');

    const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

    this.complaints = storedComplaints.filter(
      (c: any) => c.userEmail === user.email
    );

    this.total = this.complaints.length;

    this.pending = this.complaints.filter(
      (c: any) => c.status === 'Pending'
    ).length;

    this.progress = this.complaints.filter(
      (c: any) => c.status === 'In Progress'
    ).length;

    this.resolved = this.complaints.filter(
      (c: any) => c.status === 'Resolved'
    ).length;

  }

}