import { Routes } from '@angular/router';

import { Login } from './login/login';
import { RegisterComponent } from './register/register';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { Dashboard } from './dashboard/dashboard';
import { Admin } from './admin/admin';
import { Complaint } from './complaint/complaint';

import { Home } from './pages/home/home';
import { Submit } from './pages/submit/submit';
import { Track } from './pages/track/track';

import { Staff } from './staff/staff';
import { UserComponent } from './user/user';
import { MyComplaints } from './my-complaints/my-complaints';
import { Profile } from './profile/profile';
import { Layout } from './layout/layout';
import { AdminProfile } from './admin-profile/admin-profile';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  // 🌐 PUBLIC
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'profile', component: Profile },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'submit', component: Submit },
  { path: 'track/:id', component: Track },
  { path: 'staff', component: Staff },

  // 🔐 WITH SIDEBAR
  {
    path: 'app',
    component: Layout,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'complaint', component: Complaint },
      { path: 'profile', component: Profile },
      { path: 'admin-profile', component: AdminProfile },
      { path: 'my-complaints', component: MyComplaints }
    ]
  },

  // 🛠 ADMIN
  { path: 'admin', component: Admin },
  { path: 'admin/users', component: UserComponent },

  // ❗ KEEP THIS LAST
  { path: '**', redirectTo: '' }

];