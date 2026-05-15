import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-complaint',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complaint.html',
  styleUrls: ['./complaint.css']
})
export class Complaint {

  complaintForm: FormGroup;
  submitted = false;

  // CATEGORY LIST
  complaintCategories = [
    'Dirty Pool',
    'Too many garbages',
    'Water Issue',
    'Service of Personnel',
    'Public Safety',
    'Others'
  ];

  constructor(private fb: FormBuilder, private router: Router) {

    this.complaintForm = this.fb.group({
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });

  }

  // shortcut for form controls
  get f() {
    return this.complaintForm.controls;
  }

  // 🔥 GENERATE TRACKING NUMBER
  generateTracking(): string {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `TRK-${num}`;
  }

  // 🔥 SUBMIT COMPLAINT
  submitComplaint() {

    this.submitted = true;

    if (this.complaintForm.invalid) {
      return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // ✅ Prevent invalid session
    if (!user.email) {
      alert('User session expired. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    let complaints = JSON.parse(localStorage.getItem('complaints') || '[]');

   const newComplaint = {
  id: Date.now(),
  fullName: user.fullName,
  email: user.email,
  userEmail: user.email, // ✅ ADD THIS BACK (compatibility)
  category: this.complaintForm.value.category,
  description: this.complaintForm.value.description,
  trackingNumber: this.generateTracking(),
  status: "Pending",
  date: new Date().toISOString()
};

    complaints.push(newComplaint);

    localStorage.setItem('complaints', JSON.stringify(complaints));

    alert("Complaint submitted successfully");

    this.complaintForm.reset();
    this.submitted = false;

    // redirect after submit
    this.router.navigate(['/app/my-complaints']);
  }
}