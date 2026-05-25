import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // ✅ FIX ALL ERRORS HERE
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  profileForm!: FormGroup;
  currentUser: any = null;
  userRole: string = 'User';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initProfileForm();
    this.fetchLoggedSessionUser();
  }

  private initProfileForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: [{ value: 'User', disabled: true }]
    });
  }

  private fetchLoggedSessionUser(): void {
    // TEMP MOCK (replace with localStorage later)
   const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  this.currentUser = user;

    this.userRole = this.currentUser.role || 'User';

    this.profileForm.patchValue({
      fullName: this.currentUser.fullName,
      email: this.currentUser.email,
      phone: this.currentUser.phone,
      role: this.userRole
    });

    // Only admin can edit role
    if (this.userRole === 'Admin') {
      this.profileForm.get('role')?.enable();
    }
  }

  onSaveProfile(): void {
    if (this.profileForm.valid) {
      const updated = this.profileForm.getRawValue();
      console.log('Profile saved:', updated);

      alert('Profile updated successfully!');
      this.profileForm.markAsPristine();
    }
  }

  onResetForm(): void {
    if (confirm('Discard changes?')) {
      this.fetchLoggedSessionUser();
    }
  }
}