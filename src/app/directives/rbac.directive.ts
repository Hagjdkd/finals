import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { RbacService } from '../services/rbac.service';
import { UserRole } from '../models/auth.model';

/**
 * Structural Directive for Role-Based Access Control
 * Usage: <div *appHasRole="'admin'">Admin content</div>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit {
  private role: UserRole | null = null;

  @Input() set appHasRole(role: UserRole) {
    this.role = role;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RbacService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    if (this.role && this.rbacService.hasRole(this.role)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

/**
 * Structural Directive for Permission-Based Access Control
 * Usage: <div *appHasPermission="'manage_users'">Manage users content</div>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  private permission: string | null = null;

  @Input() set appHasPermission(permission: string) {
    this.permission = permission;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RbacService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    if (this.permission && this.rbacService.hasPermission(this.permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

/**
 * Structural Directive for Authentication Check
 * Usage: <div *appIsAuthenticated>Authenticated user content</div>
 */
@Directive({
  selector: '[appIsAuthenticated]',
  standalone: true
})
export class IsAuthenticatedDirective implements OnInit {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RbacService
  ) {}

  ngOnInit(): void {
    const user = this.rbacService['authService']?.getCurrentUser?.();
    if (user) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

/**
 * Attribute Directive to disable button for unauthorized users
 * Usage: <button [appDisableIfUnauthorized]="'manage_users'">Delete</button>
 */
@Directive({
  selector: 'button[appDisableIfUnauthorized]',
  standalone: true,
  host: {
    '[disabled]': 'isDisabled'
  }
})
export class DisableIfUnauthorizedDirective {
  isDisabled = false;
  private permission: string = '';

  @Input() set appDisableIfUnauthorized(permission: string) {
    this.permission = permission;
    this.updateState();
  }

  constructor(private rbacService: RbacService) {}

  ngOnInit(): void {
    this.updateState();
  }

  private updateState(): void {
    this.isDisabled = !this.rbacService.hasPermission(this.permission);
  }
}
