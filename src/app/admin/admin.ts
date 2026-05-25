import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

interface Complaint {
  id?: number;
  fullName?: string;
  name?: string;
  email: string;
  category: string;
  description: string;
  date: string;
  status: string;
  trackingNumber?: string;
  priority?: string;
  assignedTo?: string;
  escalated?: boolean;
   // NEW
  resolution?: string;
  proofImage?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {

  platformId = inject(PLATFORM_ID);

  // ===================== DATA =====================
  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];
  users: User[] = [];

  storedRegisteredUsers: any[] = [];

  selectedUser: any = { fullName: '', email: '', role: 'user' };
  isEditMode = false;

  totalUsers = 0;
  pendingComplaints = 0;
  resolvedComplaints = 0;
  inProgressCount = 0;
  totalComplaints = 0;

  isUserModalOpen = false;

  searchTerm = '';
  categoryFilter = 'All';
  statusFilter = 'All';

  activeSection = 'dashboard';

  adminProfile = { fullName: '', email: '' };
  newPassword = '';

  categoryStats: any[] = [];
  trendStats: any[] = [];
  recentComplaints: any[] = [];
  statusStats: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkAccess();
      this.initializeAdmin();
      this.loadUsers();
      this.loadData();
      this.loadConnectedUsers();
    }
  }

  // ===================== FIX: SAFE LOCALSTORAGE =====================
  safeSetUsers(users: any[]) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  safeGetUsers(): any[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  // ===================== NAV =====================
  setSection(section: string) {
    this.activeSection = section;
  }

  // ===================== USER MODAL =====================
 // ===================== USER MODAL =====================
  openUserModal() {
    this.isEditMode = false;
    this.selectedUser = { 
      fullName: '', 
      email: '', 
      role: 'user', 
      password: '', 
      staffCategory: 'room' 
    };
    this.isUserModalOpen = true;
  }

  closeUserModal() {
    this.isUserModalOpen = false;
  }

  // ===================== USERS CRUD =====================
  createUser(form: any) {
    const users = this.safeGetUsers();

    users.push({
      id: Date.now(),
      fullName: form.fullName,
      email: form.email,
      password: form.password || 'User123!',
      role: form.role || 'user',
      staffCategory: form.role?.toLowerCase() === 'staff' ? (form.staffCategory || 'room') : ''
    });

    this.safeSetUsers(users);
    this.loadConnectedUsers();
  }

  editUser(user: any) {
    // Structural object clone layout map to prevent live mutations on cancel events
    this.selectedUser = { 
      ...user,
      password: user.password || '',
      staffCategory: user.staffCategory || 'room'
    };
    this.isEditMode = true;
    this.isUserModalOpen = true;
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      let users = this.safeGetUsers().filter(u => u.id !== id);
      this.safeSetUsers(users);
      this.loadConnectedUsers();
    }
  }

  updateUser() {
    let users = this.safeGetUsers();

    users = users.map(u => {
      if (u.id === this.selectedUser.id) {
        // Enforce structural cleanup if context drops staff status roles
        if (this.selectedUser.role?.toLowerCase() !== 'staff') {
          this.selectedUser.staffCategory = '';
        }
        return this.selectedUser;
      }
      return u;
    });

    this.safeSetUsers(users);

    this.isEditMode = false;
    this.selectedUser = { fullName: '', email: '', role: 'user', password: '', staffCategory: '' };

    this.loadConnectedUsers();
  }

  loadUsers() {
    this.users = this.safeGetUsers();
  }

  loadConnectedUsers(): void {
    this.storedRegisteredUsers = this.safeGetUsers();
    this.calculateStats();
  }
  // ===================== ACCESS =====================
  checkAccess() {
    if (!isPlatformBrowser(this.platformId)) return;

    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (!user || user.role !== 'admin') {
      alert('Access denied');
      this.router.navigate(['/login']);
    }
  }

  initializeAdmin() {
    const users = this.safeGetUsers();

    const exists = users.some(u => u.role === 'admin');

    if (!exists) {
      users.push({
        id: 1,
        fullName: 'System Administrator',
        email: 'admin@system.com',
        password: 'admin123',
        role: 'admin'
      });

      this.safeSetUsers(users);
    }
  }

  // ===================== COMPLAINTS =====================
  loadData() {
    if (!isPlatformBrowser(this.platformId)) return;

    const stored = JSON.parse(localStorage.getItem('complaints') || '[]');

    this.complaints = stored.map((c: any, i: number) => ({
      id: c.id || i + 1,
      fullName: c.fullName || c.name || 'Guest',
      email: c.email || '',
      category: c.category,
      description: c.description,
      date: c.date || new Date().toISOString(),
      status: c.status || 'Pending',
      trackingNumber: c.trackingNumber || 'TRK-000',
      priority: c.priority || 'Low',
      assignedTo: c.assignedTo || 'Unassigned'
    }));

    this.filteredComplaints = [...this.complaints];

    this.calculateStats();
    this.applyFilters();
  }
  // ===================== ANALYTICS HELPERS =====================

getBarHeight(count: number) {
  const max = Math.max(...this.categoryStats.map(x => x.count || 1), 1);
  return (count / max) * 160 + 'px';
}

getTrendHeight(count: number) {
  const max = Math.max(...this.trendStats.map(x => x.count || 1), 1);
  return (count / max) * 140 + 'px';
}

getPieValue(count: number) {
  const total = this.statusStats.reduce((a, b) => a + b.count, 0) || 1;
  return `${(count / total) * 440} 440`;
}

getPieOffset(index: number) {
  const total = this.statusStats.reduce((a, b) => a + b.count, 0) || 1;

  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += (this.statusStats[i].count / total) * 440;
  }

  return -offset;
}
  applyFilters() {
    const s = this.searchTerm.toLowerCase();

    this.filteredComplaints = this.complaints.filter(c =>
      (c.fullName || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s) ||
      (c.trackingNumber || '').toLowerCase().includes(s)
    );
  }

  updateStatus(id?: number, status?: string) {
    const c = this.complaints.find(x => x.id === id);
    if (c) c.status = status || 'Pending';
    this.saveComplaints();
  }

  updatePriority(id?: number, priority?: string) {
    const c = this.complaints.find(x => x.id === id);
    if (c) c.priority = priority || 'Low';
    this.saveComplaints();
  }

  assignComplaint(id?: number, dept?: string) {
    const c = this.complaints.find(x => x.id === id);
    if (c) c.assignedTo = dept || 'Unassigned';
    this.saveComplaints();
  }

  saveComplaints() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('complaints', JSON.stringify(this.complaints));
    }
  }

 // ===================== STATS (FIXED + FULL ANALYTICS) =====================
calculateStats() {
  this.totalUsers = this.users.length;
  this.totalComplaints = this.complaints.length;

  this.pendingComplaints = this.complaints.filter(c => c.status === 'Pending').length;
  this.resolvedComplaints = this.complaints.filter(c => c.status === 'Resolved').length;
  this.inProgressCount = this.complaints.filter(c => c.status === 'In Progress').length;

  // ================= PIE CHART DATA =================
  this.statusStats = [
    { status: 'Pending', count: this.pendingComplaints, color: '#f59e0b' },
    { status: 'In Progress', count: this.inProgressCount, color: '#3b82f6' },
    { status: 'Resolved', count: this.resolvedComplaints, color: '#10b981' }
  ];

  // ================= CATEGORY CHART =================
  const categoryMap: any = {};
  this.complaints.forEach(c => {
    const key = c.category || 'Other';
    categoryMap[key] = (categoryMap[key] || 0) + 1;
  });

  this.categoryStats = Object.keys(categoryMap).map(key => ({
    category: key,
    count: categoryMap[key]
  }));

  // ================= TREND CHART =================
  const trendMap: any = {};
  this.complaints.forEach(c => {
    const date = new Date(c.date).toLocaleDateString();
    trendMap[date] = (trendMap[date] || 0) + 1;
  });

  this.trendStats = Object.keys(trendMap).map(date => ({
    date,
    count: trendMap[date]
  }));
}

  // ===================== USER MODAL SAVE =====================
  saveUserFromModal() {
    const users = this.safeGetUsers();

    if (this.isEditMode) {
      const index = users.findIndex(u => u.id === this.selectedUser.id);
      if (index !== -1) users[index] = this.selectedUser;
    } else {
      users.push({
        id: Date.now(),
        fullName: this.selectedUser.fullName,
        email: this.selectedUser.email,
        role: this.selectedUser.role
      });
    }

    this.safeSetUsers(users);
    this.loadConnectedUsers();
    this.closeUserModal();
  }

  // ===================== REPORT =====================
  exportComplaints() {
    const headers = ['Tracking', 'Name', 'Email', 'Category', 'Status', 'Date'];

    const rows = this.complaints.map(c => [
      c.trackingNumber,
      c.fullName,
      c.email,
      c.category,
      c.status,
      c.date
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.download = 'complaints-report.csv';
    a.click();
  }

  // ===================== SETTINGS =====================
  clearComplaints() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('complaints');
    }
    this.loadData();
  }

  resetUsers() {
    this.safeSetUsers([]);
    this.initializeAdmin();
    this.loadConnectedUsers();
  }

  saveProfile() {
    const users = this.safeGetUsers();
    const admin = users.find(u => u.role === 'admin');

    if (admin) {
      admin.fullName = this.adminProfile.fullName;
      admin.email = this.adminProfile.email;
      this.safeSetUsers(users);
    }
  }

  changePassword() {
    this.newPassword = '';
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.router.navigate(['/login']);
  }
}