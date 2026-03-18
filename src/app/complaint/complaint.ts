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

  submitComplaint() {

    this.submitted = true;

    if (this.complaintForm.invalid) {
      return;
    }

    const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

    let complaints = JSON.parse(localStorage.getItem('complaints') || '[]');

    const newComplaint = {

      id: Date.now(),

      userEmail: user.email,

      category: this.complaintForm.value.category,

      description: this.complaintForm.value.description,

      status: "Pending",

      date: new Date().toLocaleDateString()

    };

    complaints.push(newComplaint);

    localStorage.setItem('complaints', JSON.stringify(complaints));

    alert("Complaint submitted successfully");

    this.complaintForm.reset();

    this.submitted = false;

    // return to dashboard
    this.router.navigate(['/dashboard']);

  }

}