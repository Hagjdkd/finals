import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Complaint{
  id:number
  fullName:string
  email:string
  category:string
  description:string
  date:string
  status:string
}

interface User{
  id:number
  fullName:string
  email:string
  role:string
}

@Component({
  selector:'app-admin',
  standalone:true,
  imports:[CommonModule,FormsModule],
  templateUrl:'./admin.html',
  styleUrls:['./admin.css']
})

export class Admin implements OnInit{

/* DATA STORAGE */

complaints:Complaint[]=[]
filteredComplaints:Complaint[]=[]
users:User[]=[]

/* DASHBOARD STATS */

totalUsers=0
pendingComplaints=0
resolvedComplaints=0
totalComplaints=0

/* FILTERS */

searchTerm=''
categoryFilter='All'
statusFilter='All'

/* NOTIFICATIONS */

notificationCount=0


ngOnInit(){
  this.loadData()
}


/* LOAD DATA FROM LOCAL STORAGE */

loadData(){

  const storedUsers = localStorage.getItem('users')
  const storedComplaints = localStorage.getItem('complaints')

  this.users = storedUsers ? JSON.parse(storedUsers) : []
  this.complaints = storedComplaints ? JSON.parse(storedComplaints) : []

  this.filteredComplaints=[...this.complaints]

  this.calculateStats()

}


/* CALCULATE DASHBOARD STATISTICS */

calculateStats(){

  this.totalUsers = this.users.filter(
    u=>u.role==='user'
  ).length

  this.pendingComplaints = this.complaints.filter(
    c=>c.status==='Pending'
  ).length

  this.resolvedComplaints = this.complaints.filter(
    c=>c.status==='Approved'
  ).length

  this.totalComplaints = this.complaints.length

  this.notificationCount = this.pendingComplaints

}


/* SEARCH + FILTER SYSTEM */

applyFilters(){

  this.filteredComplaints=this.complaints.filter(c=>{

    const searchMatch =
    c.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(this.searchTerm.toLowerCase())

    const categoryMatch =
    this.categoryFilter==='All' || c.category===this.categoryFilter

    const statusMatch =
    this.statusFilter==='All' || c.status===this.statusFilter

    return searchMatch && categoryMatch && statusMatch

  })

}


/* APPROVE COMPLAINT */

approveComplaint(id:number){

  const complaint=this.complaints.find(c=>c.id===id)

  if(complaint){
    complaint.status='Approved'
  }

  localStorage.setItem(
    'complaints',
    JSON.stringify(this.complaints)
  )

  this.loadData()

}


/* REJECT COMPLAINT */

rejectComplaint(id:number){

  const complaint=this.complaints.find(c=>c.id===id)

  if(complaint){
    complaint.status='Rejected'
  }

  localStorage.setItem(
    'complaints',
    JSON.stringify(this.complaints)
  )

  this.loadData()

}

}