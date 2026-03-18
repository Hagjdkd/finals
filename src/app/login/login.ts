import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface User {
  fullName: string;
  email: string;
  password: string;
  contactNumber?: string;
  complaintCategory?: string;
  status: string;
  role: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  loginForm: FormGroup;
  message = '';
  submitted = false;

  constructor(private fb: FormBuilder, private router: Router) {

    let users: User[] = [];

    if (typeof window !== 'undefined') {
      users = JSON.parse(localStorage.getItem('users') || '[]');
    }

    // CHECK IF ADMIN EXISTS
    const adminExists = users.some(u => u.role === 'admin');

    // CREATE DEFAULT ADMIN
    if (!adminExists) {

      const defaultAdmin: User = {
        fullName: 'System Administrator',
        email: 'admin@complaint.com',
        password: 'admin123',
        contactNumber: '09123456789',
        role: 'admin',
        status: 'Approved'
      };

      users.push(defaultAdmin);

      if (typeof window !== 'undefined') {
        localStorage.setItem('users', JSON.stringify(users));
      }
    }

    // LOGIN FORM
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

  }

  onSubmit() {

    this.submitted = true;

    if (this.loginForm.invalid) {
      this.message = 'Please enter email and password.';
      return;
    }

    const { email, password } = this.loginForm.value;

    let users: User[] = [];

    if (typeof window !== 'undefined') {
      users = JSON.parse(localStorage.getItem('users') || '[]');
    }

    const foundUser = users.find(
      u => u.email === email && u.password === password
    );

    if (!foundUser) {
      this.message = 'Invalid email or password.';
      return;
    }

    // SAVE LOGGED USER
    if (typeof window !== 'undefined') {
      localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
    }

    // REDIRECT BASED ON ROLE
    if (foundUser.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }

  }

}