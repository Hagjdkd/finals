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

  selectedImage: string | null = null;
  imagePreview: string | null = null;

   // NEW
  resolution?: string;
  proofImage?: string;
  updatedAt?: string;

  submitted = false;
  success = false;
  trackingNumber = '';
  isGuest = true;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.complaintForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]], // optional email but validated
      category: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  // =========================
  // IMAGE HANDLER
  // =========================
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.selectedImage = reader.result as string;
      
    };

    reader.readAsDataURL(file);
  }

  // =========================
  // TRACKING NUMBER (FIXED)
  // =========================
  generateTracking(): string {
    return `TRK-${Date.now()}`;
  }

  // =========================
  // SUBMIT FORM
  // =========================
  onSubmit() {
    this.submitted = true;

    if (this.complaintForm.invalid) return;

    this.trackingNumber = this.generateTracking();

    const complaint = {
      id: Date.now(),
      fullName: this.complaintForm.value.name,
      email: this.complaintForm.value.email || 'N/A',
      category: this.complaintForm.value.category,
      description: this.complaintForm.value.description,
      trackingNumber: this.trackingNumber,
      status: 'Pending',
      image: this.selectedImage,
      guest: this.isGuest,
      date: new Date().toISOString()
    };

    // =========================
    // SAVE TO LOCAL STORAGE
    // =========================
    const data = JSON.parse(localStorage.getItem('complaints') ?? '[]');
    data.push(complaint);
    localStorage.setItem('complaints', JSON.stringify(data));

    // =========================
    // SUCCESS STATE
    // =========================
    this.success = true;

    // RESET FORM
    this.complaintForm.reset();
    this.selectedImage = null;
    this.imagePreview = null;
    this.isGuest = true;
    this.submitted = false;

    this.complaintForm.markAsPristine();
    this.complaintForm.markAsUntouched();

    // Scroll to success message
    setTimeout(() => {
      const el = document.querySelector('.success-container');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // =========================
  // NAVIGATION
  // =========================
  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToTrack() {
    this.router.navigate(['/track', this.trackingNumber]);
  }

  goBack() {
    window.history.back();
  }
}