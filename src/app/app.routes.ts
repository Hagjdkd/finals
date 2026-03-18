import { Routes } from '@angular/router';

import { Login } from './login/login';
import { RegisterComponent } from './register/register';
import { Dashboard } from './dashboard/dashboard';
import { Admin } from './admin/admin';
import { Complaint } from './complaint/complaint';

export const routes: Routes = [

  { path: '', component: Login },

  { path: 'login', component: Login },

  { path: 'register', component: RegisterComponent },

  { path: 'dashboard', component: Dashboard },

  { path: 'complaint', component: Complaint },

  { path: 'admin', component: Admin }

];