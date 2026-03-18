import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})

export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  submitted = false;

  users: any[] = [];   // USERS TABLE DATA

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
  private router: Router,
  @Inject(PLATFORM_ID) private platformId: Object
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

  ngOnInit(){
    this.loadUsers();   // LOAD USERS FOR TABLE
  }

  /* LOAD USERS FROM STORAGE */

  loadUsers(){

  if (isPlatformBrowser(this.platformId)) {
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
  }

}

  /* PASSWORD MATCH VALIDATOR */

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

  /* FORM SHORTCUT */

  get f() {
    return this.registerForm.controls;
  }

  /* REGISTER FUNCTION */

  onSubmit() {

    this.submitted = true;

    if (this.registerForm.invalid) return;

    let users: any[] = [];

    if (isPlatformBrowser(this.platformId)) {
    users = JSON.parse(localStorage.getItem('users') || '[]');
    }

    const emailExists = users.some((u: any) =>
      u.email === this.registerForm.value.email
    );

    if (emailExists) {
      alert('Email already registered!');
      return;
    }


    const newUser = {

      id: Date.now(),
      
      username: this.registerForm.value.username,

      fullName: this.registerForm.value.fullName,

      email: this.registerForm.value.email,

      contactNumber: this.registerForm.value.contactNumber,

      address: this.registerForm.value.address, 

      password: this.registerForm.value.password,

      complaintCategory: this.registerForm.value.complaintCategory || '',

      role: 'user'

    };

    users.push(newUser);

    localStorage.setItem('users', JSON.stringify(users));

    this.loadUsers();

    alert('Registration successful!');

    this.registerForm.reset();
    this.submitted = false;

  }

}