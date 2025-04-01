import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { SEARCH_EMPLOYEE_BY_ID } from '../../graphql/queries';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  template: `
    <mat-card *ngIf="employee" class="detail-card">
      <h2>{{ employee.first_name }} {{ employee.last_name }}</h2>
      <p><strong>Email:</strong> {{ employee.email }}</p>
      <p><strong>Designation:</strong> {{ employee.designation }}</p>
      <p><strong>Department:</strong> {{ employee.department }}</p>
      <p><strong>Gender:</strong> {{ employee.gender }}</p>
      <p>
        <strong>Salary:</strong>
        {{ '$' + (employee.salary | number : '1.0-0') }}
      </p>
      <p>
        <strong>Date of Joining:</strong> {{ employee.date_of_joining | date }}
      </p>

      <img
        *ngIf="employee.employee_photo"
        [src]="employee.employee_photo"
        width="150"
      />

      <button mat-button color="primary" (click)="goBack()">Back</button>
    </mat-card>
  `,
  styles: [
    `
      .detail-card {
        max-width: 500px;
        margin: 2rem auto;
        padding: 1rem;
      }
      img {
        margin-top: 1rem;
        border-radius: 8px;
      }
    `,
  ],
})
export class EmployeeDetailComponent {
  employee: any = null;

  private route = inject(ActivatedRoute);
  private apollo = inject(Apollo);
  private router = inject(Router);

  ngOnInit() {
    const eid = this.route.snapshot.paramMap.get('id');
    if (!eid) return;

    this.apollo
      .watchQuery({
        query: SEARCH_EMPLOYEE_BY_ID,
        variables: { eid },
      })
      .valueChanges.subscribe((res: any) => {
        this.employee = res.data.searchEmployeeByEid;
      });
  }

  goBack() {
    this.router.navigate(['/employees']);
  }
}
