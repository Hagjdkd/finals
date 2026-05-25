import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole } from '../models/auth.model';

/**
 * Role-Based Access Control Service
 * Manages permissions and access control for different user roles
 */
@Injectable({
  providedIn: 'root'
})
export class RbacService {

  private rolePermissions: { [key in UserRole]: string[] } = {
    [UserRole.ADMIN]: [
      'view_dashboard',
      'manage_users',
      'manage_complaints',
      'view_reports',
      'view_analytics',
      'manage_settings',
      'manage_staff',
      'view_audit_logs'
    ],
    [UserRole.STAFF]: [
      'view_dashboard',
      'manage_complaints',
      'respond_complaints',
      'view_reports'
    ],
    [UserRole.CLIENT]: [
      'view_dashboard',
      'submit_complaint',
      'view_own_complaints',
      'track_complaint',
      'edit_own_complaint'
    ]
  };

  constructor(private authService: AuthService) {}

  /**
   * Check if current user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    const permissions = this.rolePermissions[user.role];
    return permissions ? permissions.includes(permission) : false;
  }

  /**
   * Check if current user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if current user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Check if current user has a specific role
   */
  hasRole(role: UserRole): boolean {
    const user = this.authService.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Check if current user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Get all permissions for a specific role
   */
  getPermissionsForRole(role: UserRole): string[] {
    return this.rolePermissions[role] || [];
  }

  /**
   * Get current user's permissions
   */
  getCurrentUserPermissions(): string[] {
    const user = this.authService.getCurrentUser();
    if (!user) return [];
    return this.rolePermissions[user.role] || [];
  }

  /**
   * Get all roles
   */
  getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  /**
   * Update permissions for a role (Admin only)
   */
  updateRolePermissions(role: UserRole, permissions: string[]): boolean {
    if (!this.hasRole(UserRole.ADMIN)) {
      console.warn('Only admins can update role permissions');
      return false;
    }

    this.rolePermissions[role] = permissions;
    return true;
  }

  /**
   * Add permission to a role
   */
  addPermissionToRole(role: UserRole, permission: string): boolean {
    if (!this.hasRole(UserRole.ADMIN)) {
      return false;
    }

    if (!this.rolePermissions[role].includes(permission)) {
      this.rolePermissions[role].push(permission);
    }

    return true;
  }

  /**
   * Remove permission from a role
   */
  removePermissionFromRole(role: UserRole, permission: string): boolean {
    if (!this.hasRole(UserRole.ADMIN)) {
      return false;
    }

    const index = this.rolePermissions[role].indexOf(permission);
    if (index > -1) {
      this.rolePermissions[role].splice(index, 1);
    }

    return true;
  }
}
