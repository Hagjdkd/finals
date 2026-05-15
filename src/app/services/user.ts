import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private storageKey = 'users';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /* GET USERS */
  getUsers(): any[] {

    if (isPlatformBrowser(this.platformId)) {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    return [];
  }

  /* ADD USER */
  addUser(user: any) {

    if (!isPlatformBrowser(this.platformId)) return;

    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  /* UPDATE USER */
  updateUser(updatedUser: any) {

    if (!isPlatformBrowser(this.platformId)) return;

    let users = this.getUsers();

    users = users.map(u =>
      u.id === updatedUser.id ? updatedUser : u
    );

    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  /* DELETE USER */
  deleteUser(id: number) {

    if (!isPlatformBrowser(this.platformId)) return;

    let users = this.getUsers();

    users = users.filter(u => u.id !== id);

    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

}