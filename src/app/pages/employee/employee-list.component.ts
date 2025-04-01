import { Component, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import {
  GET_ALL_EMPLOYEES,
  SEARCH_EMPLOYEES,
  DELETE_EMPLOYEE,
} from '../../graphql/queries';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EditEmployeeComponent } from './edit-employee.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterModule,
  ],
  template: `
    <div
      style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"
    >
      <h2>Employee List</h2>
      <button mat-button color="warn" (click)="logout()">Logout</button>
    </div>

    <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
      <mat-form-field appearance="outline">
        <mat-label>Designation</mat-label>
        <input matInput formControlName="designation" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Department</mat-label>
        <input matInput formControlName="department" />
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit">Search</button>
      <button mat-button type="button" (click)="resetSearch()">Reset</button>
    </form>

    <div style="margin: 1rem 0;">
      <button mat-raised-button color="accent" (click)="goToAdd()">
        Add Employee
      </button>
    </div>

    <table
      mat-table
      [dataSource]="employees"
      class="mat-elevation-z8 full-width-table"
    >
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let emp">
          {{ emp.first_name }} {{ emp.last_name }}
        </td>
      </ng-container>

      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef>Email</th>
        <td mat-cell *matCellDef="let emp">{{ emp.email }}</td>
      </ng-container>

      <ng-container matColumnDef="designation">
        <th mat-header-cell *matHeaderCellDef>Designation</th>
        <td mat-cell *matCellDef="let emp">{{ emp.designation }}</td>
      </ng-container>

      <ng-container matColumnDef="department">
        <th mat-header-cell *matHeaderCellDef>Department</th>
        <td mat-cell *matCellDef="let emp">{{ emp.department }}</td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let emp">
          <button mat-button (click)="viewEmployee(emp._id)">View</button>
          <button mat-button color="primary" (click)="openEditDialog(emp)">
            Edit
          </button>
          <button mat-button color="warn" (click)="deleteEmployee(emp._id)">
            Delete
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns"></tr>
    </table>

    <p *ngIf="employees.length === 0">No employees found.</p>
  `,
  styles: [
    `
      .search-form {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .full-width-table {
        width: 100%;
      }
    `,
  ],
})
export class EmployeeListComponent {
  apollo = inject(Apollo);
  fb = inject(FormBuilder);
  snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);

  employees: any[] = [];
  columns = ['name', 'email', 'designation', 'department', 'actions'];

  constructor(private router: Router) {}

  searchForm = this.fb.group({
    designation: [''],
    department: [''],
  });

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.apollo
      .watchQuery({
        query: GET_ALL_EMPLOYEES,
      })
      .valueChanges.subscribe((res: any) => {
        this.employees = res.data.getAllEmployees;
      });
  }

  onSearch() {
    const { designation, department } = this.searchForm.value;
    this.apollo
      .watchQuery({
        query: SEARCH_EMPLOYEES,
        variables: { designation, department },
      })
      .valueChanges.subscribe((res: any) => {
        this.employees = res.data.searchEmployeeByDesignationOrDepartment;
      });
  }

  resetSearch() {
    this.searchForm.reset();
    this.loadAll();
  }

  goToAdd() {
    this.router.navigate(['/employees/add']);
  }

  viewEmployee(eid: string) {
    this.router.navigate(['/employees', eid]);
  }

  openEditDialog(emp: any) {
    const ref = this.dialog.open(EditEmployeeComponent, {
      data: emp,
      width: '500px',
    });

    ref.afterClosed().subscribe((updated) => {
      if (updated) this.loadAll();
    });
  }

  deleteEmployee(eid: string) {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    this.apollo
      .mutate({
        mutation: DELETE_EMPLOYEE,
        variables: { eid },
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Employee deleted successfully', 'Close', {
            duration: 3000,
          });
          this.loadAll();
        },
        error: (err) => {
          console.error('Delete Error:', err);
          this.snackBar.open('Failed to delete employee', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
