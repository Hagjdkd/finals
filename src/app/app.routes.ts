import { Routes } from '@angular/router';

import { Login } from './login/login';
import { RegisterComponent } from './register/register';
import { Dashboard } from './dashboard/dashboard';
import { Admin } from './admin/admin';
import { Complaint } from './complaint/complaint';

import { Home } from './pages/home/home';
import { Submit } from './pages/submit/submit';
import { Track } from './pages/track/track';

import { UserComponent } from './user/user';
import { MyComplaints } from './my-complaints/my-complaints';

import { Layout } from './layout/layout';

export const routes: Routes = [

  // 🌐 PUBLIC
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: RegisterComponent },
  { path: 'submit', component: Submit },
  { path: 'track/:id', component: Track },

  // 🔐 WITH SIDEBAR
  {
    path: 'app',
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'complaint', component: Complaint },
      { path: 'my-complaints', component: MyComplaints }
    ]
  },

  // 🛠 ADMIN
  { path: 'admin', component: Admin },
  { path: 'admin/users', component: UserComponent },

  // ❗ KEEP THIS LAST
  { path: '**', redirectTo: '' }

];