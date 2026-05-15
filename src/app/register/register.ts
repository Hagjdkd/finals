import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  registerForm: FormGroup;
  submitted = false;

  complaintCategories = [
    'Infrastructure',
    'IT Services',
    'Staff Behavior',
    'Billing Concern',
    'Academic Concern',
    'Others'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {

    this.registerForm = this.fb.group({

      username: ['', Validators.required],

      fullName: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z\s]+$/)
      ]],

      email: ['', [Validators.required, Validators.email]],

      contactNumber: ['', [
        Validators.required,
        Validators.pattern(/^09\d{9}$/)
      ]],

      address: ['', Validators.required],

      complaintCategory: [''],

      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
      ]],

      confirmPassword: ['', Validators.required]

    }, {
      validators: this.passwordMatchValidator
    });

  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword');

    if (!confirmPassword) return;

    if (password !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    } else {
      confirmPassword.setErrors(null);
    }
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {

    this.submitted = true;
    if (this.registerForm.invalid) return;

    const formValue = this.registerForm.value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const emailExists = users.some((u: any) =>
      u.email.trim().toLowerCase() === formValue.email.trim().toLowerCase()
    );

    if (emailExists) {
      alert('Email already registered!');
      return;
    }

    const userData = {
  id: Date.now(),
  username: formValue.username ?? '',
  fullName: formValue.fullName ?? '',
  email: formValue.email ?? '',
  contactNumber: formValue.contactNumber ?? '',
  address: formValue.address ?? '',
  password: formValue.password ?? '',
  complaintCategory: formValue.complaintCategory ?? '',
  role: 'user',
  status: 'Approved'
};
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful!');

    this.registerForm.reset();
    this.submitted = false;

    this.router.navigate(['/login']);
  }

  goBack() {
  this.router.navigate(['/login']);
}
}