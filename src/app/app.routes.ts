import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'employees',
    loadComponent: () =>
      import('./pages/employee/employee-list.component').then(
        (m) => m.EmployeeListComponent
      ),
  },
  {
    path: 'employees/add',
    loadComponent: () =>
      import('./pages/employee/add-employee.component').then(
        (m) => m.AddEmployeeComponent
      ),
  },
  {
    path: 'employees/:id',
    loadComponent: () =>
      import('./pages/employee/employee-detail.component').then(
        (m) => m.EmployeeDetailComponent
      ),
  },
];
