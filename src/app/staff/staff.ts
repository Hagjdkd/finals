import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff.html',
  styleUrls: ['./staff.css']
})
export class Staff implements OnInit {

  platformId = inject(PLATFORM_ID);
constructor(private router: Router) {}
  // ===================== USER =====================
  user: any = null;

  // ===================== COMPLAINTS =====================
  complaints: any[] = [];
  filteredComplaints: any[] = [];

  resolution?: string;
  proofImage?: string;
  updatedAt?: string;

  // ===================== INIT =====================
  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) return;

    // CURRENT LOGGED USER
    this.user = JSON.parse(
      localStorage.getItem('currentUser') || 'null'
    );

    // LOAD STAFF COMPLAINTS
    this.loadComplaints();
  }
  onFileSelected(event: any, complaint: any): void {

  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    complaint.proofImage = reader.result as string;
  };

  reader.readAsDataURL(file);
}
saveResolution(complaint: any): void {

  if (!isPlatformBrowser(this.platformId)) return;

  const allComplaints = JSON.parse(
    localStorage.getItem('complaints') || '[]'
  );

  const index = allComplaints.findIndex(
    (c: any) => c.id === complaint.id
  );

  if (index !== -1) {

    allComplaints[index].status = complaint.status;

    allComplaints[index].resolution =
      complaint.resolution || '';

    allComplaints[index].proofImage =
      complaint.proofImage || '';

    allComplaints[index].updatedAt =
      new Date().toISOString();

    localStorage.setItem(
      'complaints',
      JSON.stringify(allComplaints)
    );
  }

  alert('Resolution saved successfully!');
}
  // ===================== LOAD COMPLAINTS =====================
  loadComplaints(): void {

    if (!isPlatformBrowser(this.platformId)) return;

    const allComplaints = JSON.parse(
      localStorage.getItem('complaints') || '[]'
    );

    // ONLY SHOW ASSIGNED CATEGORY
    this.complaints = allComplaints.filter((c: any) =>
      c.assignedTo === this.user?.category
    );

    this.filteredComplaints = [...this.complaints];
  }

  // ===================== UPDATE STATUS =====================
  updateStatus(id: number, status: string): void {

    if (!isPlatformBrowser(this.platformId)) return;

    const allComplaints = JSON.parse(
      localStorage.getItem('complaints') || '[]'
    );

    const complaint = allComplaints.find((c: any) => c.id === id);

    if (complaint) {
      complaint.status = status;
    }

    localStorage.setItem(
      'complaints',
      JSON.stringify(allComplaints)
    );

    this.loadComplaints();
  }
  logout() {
  localStorage.removeItem('currentUser');
  this.router.navigate(['/login']);
}
  // ===================== CATEGORY =====================
  getCategory(): string {
    return this.user?.category || 'Unassigned';
  }

}