import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {

  loginForm: FormGroup;
  message = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.createDefaultAdmin();
    }
  }

  // =========================
  // 🔐 CREATE DEFAULT ADMIN
  // =========================
  createDefaultAdmin() {

    const users = JSON.parse(localStorage.getItem('users') ?? '[]');
   
    const adminExists = users.some((u: any) => u.role === 'admin');

    if (!adminExists) {
      const defaultAdmin = {
        id: 1,
        fullName: 'System Administrator',
        email: 'admin@bryztoff.com',   // ✅ correct email
        password: 'admin123',
        role: 'admin'
      };

      users.push(defaultAdmin);
      localStorage.setItem('users', JSON.stringify(users));
    }
  }


  // =========================
  // 🔑 LOGIN FUNCTION
  // =========================
  onSubmit() {

    this.submitted = true;

    if (this.loginForm.invalid) {
      this.message = 'Please enter valid email and password.';
      return;
    }

    if (!isPlatformBrowser(this.platformId)) return;

    const email = this.loginForm.value.email.trim().toLowerCase();
    const password = this.loginForm.value.password;
     const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const users = JSON.parse(localStorage.getItem('users') ?? '[]');

    const foundUser = users.find(
      (u: any) =>
        u.email?.toLowerCase() === email &&
        u.password === password
    );

    if (!foundUser) {
      this.message = 'Invalid email or password.';
      return;
    }
    if (foundUser.role === 'admin') {
      this.router.navigate(['/app/admin-profile']);
    } else {
      this.router.navigate(['/app/profile']);
    }
    // ✅ SAVE USER SESSION
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    if (user.role === 'Staff') {
      this.router.navigate(['/staff']);
    }
    // ✅ REDIRECT
    if (foundUser.role === 'admin') {
      this.router.navigateByUrl('/admin');
    } else {
      this.router.navigateByUrl('app/dashboard'); // or '/user'
    }
    
  }

  goBack() {
  this.router.navigate(['/home']);
}
}