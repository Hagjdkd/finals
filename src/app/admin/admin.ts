import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { UserComponent } from '../user/user';

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
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, UserComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {

  platformId = inject(PLATFORM_ID);

  // ===================== DATA =====================
  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];
  users: User[] = [];

  totalUsers = 0;
  pendingComplaints = 0;
  resolvedComplaints = 0;
  inProgressCount = 0;
  totalComplaints = 0;

  searchTerm = '';
  categoryFilter = 'All';
  statusFilter = 'All';

  activeSection: string = 'dashboard';

  adminProfile = { fullName: '', email: '' };
  newPassword = '';

  // ===================== ANALYTICS =====================
  categoryStats: { category: string; count: number; percentage?: number }[] = [];
  trendStats: { date: string; count: number }[] = [];
  recentComplaints: Complaint[] = [];

  statusStats: { status: string; count: number; color: string }[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkAccess();
    this.initializeAdmin();
    this.loadData();
  }

  setSection(section: string) {
    this.activeSection = section;
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

  // ===================== ADMIN INIT =====================
  initializeAdmin() {
    if (!isPlatformBrowser(this.platformId)) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const adminExists = users.some((u: any) => u.role === 'admin');

    if (!adminExists) {
      users.push({
        id: 1,
        fullName: 'System Administrator',
        email: 'admin@bryztoff.com',
        password: 'admin123',
        role: 'admin'
      });

      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  // ===================== LOAD DATA =====================
  loadData() {
    if (!isPlatformBrowser(this.platformId)) return;

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const storedComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');

    this.users = storedUsers;

    this.complaints = storedComplaints.map((c: any, index: number) => ({
      id: c.id || index + 1,
      fullName: c.fullName || c.name || 'Guest',
      email: c.email || 'N/A',
      category: c.category,
      description: c.description,
      date: c.date || new Date().toISOString(),
      status: this.formatStatus(c.status),
      trackingNumber: c.trackingNumber || 'TRK-000000',
      priority: c.priority || this.setPriority(c.description),
      assignedTo: c.assignedTo || this.autoAssign(c.category),
      escalated: c.escalated || false
    }));

    this.filteredComplaints = [...this.complaints];

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (currentUser) {
      this.adminProfile.fullName = currentUser.fullName;
      this.adminProfile.email = currentUser.email;
    }

    this.calculateStats();
    this.applyFilters();
  }

  // ===================== STATUS FORMAT =====================
  formatStatus(status: string): string {
    if (!status) return 'Pending';

    const s = status.toLowerCase();
    if (s.includes('progress')) return 'In Progress';
    if (s.includes('resolve')) return 'Resolved';

    return 'Pending';
  }

  // ===================== AUTO LOGIC =====================
  autoAssign(category: string): string {
    switch ((category || '').toLowerCase()) {
      case 'it': return 'IT Department';
      case 'billing': return 'Finance Department';
      case 'maintenance': return 'Maintenance Team';
      default: return 'General Support';
    }
  }

  setPriority(description: string): 'Low' | 'Medium' | 'High' {
    const text = (description || '').toLowerCase();

    if (text.includes('urgent') || text.includes('emergency')) return 'High';
    if (text.includes('delay') || text.includes('slow')) return 'Medium';

    return 'Low';
  }

  // ===================== ESCALATION =====================
  checkEscalations() {
    const now = new Date().getTime();

    this.complaints.forEach(c => {
      const created = new Date(c.date).getTime();
      const hours = (now - created) / (1000 * 60 * 60);

      if (c.status === 'Pending' && hours > 24) {
        c.priority = 'High';
        c.escalated = true;
      }
    });

    localStorage.setItem('complaints', JSON.stringify(this.complaints));
  }

  // ===================== STATS =====================
  calculateStats() {

    this.totalUsers = this.users.filter(u => u.role === 'user').length;

    this.pendingComplaints = this.complaints.filter(c => c.status === 'Pending').length;
    this.resolvedComplaints = this.complaints.filter(c => c.status === 'Resolved').length;
    this.inProgressCount = this.complaints.filter(c => c.status === 'In Progress').length;

    this.totalComplaints = this.complaints.length;

    this.calculateCategoryStats();
    this.calculateTrendStats();
    this.calculateRecentActivity();
    this.calculateStatusStats();
  }

  // ===================== PIE CHART DATA =====================
  calculateStatusStats() {

    const total = this.totalComplaints || 1;

    this.statusStats = [
      {
        status: 'Pending',
        count: this.pendingComplaints,
        color: '#f59e0b'
      },
      {
        status: 'In Progress',
        count: this.inProgressCount,
        color: '#3b82f6'
      },
      {
        status: 'Resolved',
        count: this.resolvedComplaints,
        color: '#10b981'
      }
    ].map(s => ({
      ...s,
      percentage: Math.round((s.count / total) * 100)
    }));
  }

  // ===================== CATEGORY =====================
  calculateCategoryStats() {
    const map: any = {};

    this.complaints.forEach(c => {
      const cat = c.category || 'Other';
      map[cat] = (map[cat] || 0) + 1;
    });

    this.categoryStats = Object.keys(map).map(key => ({
      category: key,
      count: map[key],
      percentage: Math.round((map[key] / this.totalComplaints) * 100)
    }));
  }

  // ===================== TREND =====================
  calculateTrendStats() {
    const map: any = {};

    this.complaints.forEach(c => {
      const date = new Date(c.date).toLocaleDateString();
      map[date] = (map[date] || 0) + 1;
    });

    this.trendStats = Object.keys(map).map(key => ({
      date: key,
      count: map[key]
    }));
  }

  // ===================== RECENT =====================
  calculateRecentActivity() {
    this.recentComplaints = [...this.complaints]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  // ===================== GRAPH HELPERS =====================
  getBarHeight(count: number) {
    const max = Math.max(...this.categoryStats.map(c => c.count || 1), 1);
    return (count / max) * 160 + 'px';
  }

  getTrendHeight(count: number) {
    const max = Math.max(...this.trendStats.map(t => t.count || 1), 1);
    return (count / max) * 140 + 'px';
  }

  getPieValue(count: number) {
    const total = this.statusStats.reduce((sum, s) => sum + s.count, 0) || 1;
    return `${(count / total) * 440} 440`;
  }

  getPieOffset(index: number) {
    const total = this.statusStats.reduce((sum, s) => sum + s.count, 0) || 1;

    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += (this.statusStats[i].count / total) * 440;
    }

    return -offset;
  }

  // ===================== FILTER =====================
  applyFilters() {
    this.filteredComplaints = this.complaints.filter(c => {

      const search = this.searchTerm.toLowerCase();

      const matchSearch =
        (c.fullName || '').toLowerCase().includes(search) ||
        (c.email || '').toLowerCase().includes(search) ||
        (c.trackingNumber || '').toLowerCase().includes(search);

      const matchCategory =
        this.categoryFilter === 'All' || c.category === this.categoryFilter;

      const matchStatus =
        this.statusFilter === 'All' || c.status === this.statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }

  // ===================== UPDATE =====================
  updateStatus(id: number | undefined, status: string) {
    const c = this.complaints.find(x => x.id === id);
    if (c) c.status = status;

    localStorage.setItem('complaints', JSON.stringify(this.complaints));
    this.loadData();
  }

  updatePriority(id: number | undefined, priority?: string) {
    const c = this.complaints.find(x => x.id === id);
    if (c) c.priority = priority || 'Low';

    localStorage.setItem('complaints', JSON.stringify(this.complaints));
    this.loadData();
  }

  assignComplaint(id: number | undefined, dept?: string) {
    const c = this.complaints.find(x => x.id === id);
    if (c) c.assignedTo = dept || 'Unassigned';

    localStorage.setItem('complaints', JSON.stringify(this.complaints));
    this.loadData();
  }

  // ===================== EXPORT =====================
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
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = 'report.csv';
    link.click();
  }

  // ===================== PROFILE =====================
  saveProfile() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const admin = users.find((u: any) => u.role === 'admin');

    if (admin) {
      admin.fullName = this.adminProfile.fullName;
      admin.email = this.adminProfile.email;

      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(admin));

      alert('Profile updated');
    }
  }

  changePassword() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const admin = users.find((u: any) => u.role === 'admin');

    if (admin) {
      admin.password = this.newPassword;
      localStorage.setItem('users', JSON.stringify(users));

      alert('Password updated');
      this.newPassword = '';
    }
  }

  // ===================== SYSTEM =====================
  clearComplaints() {
    localStorage.removeItem('complaints');
    this.loadData();
  }

  resetUsers() {
    localStorage.removeItem('users');
    this.initializeAdmin();
    this.loadData();
  }

  // ===================== LOGOUT =====================
  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}