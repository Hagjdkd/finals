import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './submit.html',
  styleUrls: ['./submit.css']
})
export class Submit implements OnInit {

  complaintForm!: FormGroup;

  submitted = false;
  success = false;
  trackingNumber = '';
  isGuest = true;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.complaintForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      category: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  // 🔥 Generate tracking number
  generateTracking(): string {
  const data = JSON.parse(localStorage.getItem('complaints') || '[]');
  const count = data.length + 1;
  return `TRK-${count.toString().padStart(6, '0')}`;
}

  // 🔥 Submit form
  onSubmit() {
    this.submitted = true;

    if (this.complaintForm.invalid) return;

    this.trackingNumber = this.generateTracking();

    const complaint = {
  id: Date.now(), // ✅ unique ID
  fullName: this.complaintForm.value.name,
  email: this.complaintForm.value.email || 'N/A',
  category: this.complaintForm.value.category,
  description: this.complaintForm.value.description,
  trackingNumber: this.trackingNumber,
  status: 'Pending',
  guest: this.isGuest,
  date: new Date().toISOString()
};

    // Save to localStorage
    const data = JSON.parse(localStorage.getItem('complaints') || '[]');
    data.push(complaint);
    localStorage.setItem('complaints', JSON.stringify(data));

    // Show success
    this.success = true;

    // Reset form
    this.complaintForm.reset();
    this.isGuest = true;
    this.submitted = false;

    // Optional: auto scroll to success
    setTimeout(() => {
      const el = document.querySelector('.success-container');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // 🔥 Navigate to login
  goToLogin() {
    this.router.navigate(['/login']);
  }
  
  goToTrack() {
  this.router.navigate(['/track', this.trackingNumber]);
}

goBack() {
  window.history.back(); // simple and effective
}
}