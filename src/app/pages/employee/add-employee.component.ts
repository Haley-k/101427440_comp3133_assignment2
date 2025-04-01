import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Router, RouterModule } from '@angular/router';
import { ADD_NEW_EMPLOYEE } from '../../graphql/queries';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatCardModule,
  ],
  template: `
    <mat-card class="form-card">
      <h2>Add New Employee</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="first_name" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="last_name" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Gender</mat-label>
          <mat-select formControlName="gender">
            <mat-option value="Male">Male</mat-option>
            <mat-option value="Female">Female</mat-option>
            <mat-option value="Other">Other</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Designation</mat-label>
          <input matInput formControlName="designation" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Salary</mat-label>
          <input matInput type="number" formControlName="salary" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Date of Joining</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            formControlName="date_of_joining"
          />
          <mat-datepicker-toggle matSuffix [for]="picker" />
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Department</mat-label>
          <input matInput formControlName="department" />
        </mat-form-field>

        <div class="upload-box">
          <label for="photoInput">Upload Photo:</label>
          <input
            type="file"
            accept="image/*"
            id="photoInput"
            (change)="onFileSelected($event)"
          />
        </div>

        <img *ngIf="photoPreview" [src]="photoPreview" class="preview" />

        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="form.invalid || isUploading"
        >
          {{ isUploading ? 'Uploading...' : 'Add Employee' }}
        </button>
        <button mat-button color="primary" (click)="goBack()">Back</button>
      </form>
    </mat-card>
  `,
  styles: [
    `
      .form-card {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
      }
      .full-width {
        width: 100%;
      }
      .upload-box {
        margin: 1rem 0;
      }
      .preview {
        width: 120px;
        height: 120px;
        object-fit: cover;
        margin-bottom: 1rem;
        border-radius: 8px;
        border: 1px solid #ccc;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
    `,
  ],
})
export class AddEmployeeComponent {
  form: FormGroup;

  photoPreview: string | null = null;
  isUploading = false;

  private CLOUDINARY_URL =
    'https://api.cloudinary.com/v1_1/dsw8g6wau/image/upload';
  private UPLOAD_PRESET = 'asgn2_3133';

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['Other'],
      designation: ['', Validators.required],
      salary: [null, Validators.required],
      date_of_joining: [null, Validators.required],
      department: ['', Validators.required],
      employee_photo: [''],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploading = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.UPLOAD_PRESET);

    fetch(this.CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        this.photoPreview = data.secure_url;
        this.form.patchValue({ employee_photo: data.secure_url });
      })
      .catch((err) => {
        console.error('Upload error', err);
        this.snackBar.open('Image upload failed', 'Close', { duration: 3000 });
      })
      .finally(() => {
        this.isUploading = false;
      });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const input = {
      ...this.form.value,
      date_of_joining: this.form.value.date_of_joining?.toISOString(),
    };

    this.apollo
      .mutate({
        mutation: ADD_NEW_EMPLOYEE,
        variables: { input },
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Employee added successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/employees']);
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to add employee', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  goBack() {
    this.router.navigate(['/employees']);
  }
}
