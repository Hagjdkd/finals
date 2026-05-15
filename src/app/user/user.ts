import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.html',
  styleUrls: ['./user.css'],
})
export class UserComponent implements OnInit {

  platformId = inject(PLATFORM_ID); // ✅ ADD

  users: User[] = [];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    if (!isPlatformBrowser(this.platformId)) return; // ✅ ADD

    try {
      const storedUsers = localStorage.getItem('users');

      this.users = storedUsers
        ? (JSON.parse(storedUsers) as User[])
        : [];

    } catch (error) {
      console.error('Error loading users:', error);
      this.users = [];
    }
  }

  deleteUser(id: number): void {
    if (!isPlatformBrowser(this.platformId)) return; // ✅ ADD

    const confirmDelete = confirm('Delete this user?');
    if (!confirmDelete) return;

    this.users = this.users.filter(user => user.id !== id);

    localStorage.setItem('users', JSON.stringify(this.users));

    this.loadUsers();
  }

  trackById(index: number, user: User): number {
    return user.id;
  }
}