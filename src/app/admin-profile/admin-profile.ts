import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile.html'
})
export class AdminProfile implements OnInit {

  adminForm!: FormGroup;
  currentUser: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAdmin();
  }

  initForm() {
    this.adminForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: [{ value: 'Admin', disabled: true }]
    });
  }

  loadAdmin() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (this.currentUser.role !== 'Admin') {
      alert('Access Denied');
      return;
    }

    this.adminForm.patchValue(this.currentUser);
  }

  save() {
    if (this.adminForm.valid) {
      const updated = {
        ...this.currentUser,
        ...this.adminForm.getRawValue()
      };

      localStorage.setItem('currentUser', JSON.stringify(updated));
      alert('Admin profile updated!');
    }
  }
}