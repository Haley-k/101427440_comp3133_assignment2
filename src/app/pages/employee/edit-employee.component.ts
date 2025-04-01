import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { UPDATE_EMPLOYEE } from '../../graphql/queries';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
  ],
  template: `
    <h2>Edit Employee</h2>
    <form
      [formGroup]="form"
      (ngSubmit)="onUpdate()"
      style="max-height: 80vh; overflow-y: auto; padding-bottom: 1rem;"
    >
      <mat-form-field class="full-width">
        <mat-label>First Name</mat-label>
        <input matInput formControlName="first_name" />
      </mat-form-field>

      <mat-form-field class="full-width">
        <mat-label>Last Name</mat-label>
        <input matInput formControlName="last_name" />
      </mat-form-field>

      <mat-form-field class="full-width">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" />
      </mat-form-field>

      <mat-form-field class="full-width">
        <mat-label>Gender</mat-label>
        <mat-select formControlName="gender">
          <mat-option value="Male">Male</mat-option>
          <mat-option value="Female">Female</mat-option>
          <mat-option value="Other">Other</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field class="full-width">
        <mat-label>Designation</mat-label>
        <input matInput formControlName="designation" />
      </mat-form-field>

      <mat-form-field class="full-width">
        <mat-label>Salary</mat-label>
        <input matInput type="number" formControlName="salary" />
      </mat-form-field>

      <mat-form-field class="full-width">
        <mat-label>Department</mat-label>
        <input matInput formControlName="department" />
      </mat-form-field>

      <mat-form-field class="full-width">
        <mat-label>Date of Joining</mat-label>
        <input
          matInput
          [matDatepicker]="picker"
          formControlName="date_of_joining"
        />
        <mat-datepicker-toggle matSuffix [for]="picker" />
        <mat-datepicker #picker></mat-datepicker>
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

      <div
        style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;"
      >
        <button mat-button mat-dialog-close type="button">Close</button>
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="form.invalid"
        >
          Update
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
        margin-bottom: 1rem;
      }
      .upload-box {
        margin: 1rem 0;
      }
      .preview {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid #ccc;
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class EditEmployeeComponent implements OnInit {
  form: FormGroup;
  photoPreview: string | null = null;
  isUploading = false;

  private CLOUDINARY_URL =
    'https://api.cloudinary.com/v1_1/dsw8g6wau/image/upload';
  private UPLOAD_PRESET = 'asgn2_3133';

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private dialogRef: MatDialogRef<EditEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['Other'],
      designation: ['', Validators.required],
      salary: [null, Validators.required],
      department: ['', Validators.required],
      date_of_joining: [null, Validators.required],
      employee_photo: [''],
    });
  }

  ngOnInit(): void {
    console.log('Incoming employee data:', this.data);
    setTimeout(() => {
      this.form.patchValue({
        ...this.data,
        gender: this.data.gender || 'Other',
        salary: this.data.salary || null,
        date_of_joining: this.parseValidDate(this.data.date_of_joining),
        employee_photo: this.data.employee_photo || '',
      });

      if (this.data.employee_photo) {
        this.photoPreview = this.data.employee_photo;
      }
    });
  }

  parseValidDate(date: any): Date | null {
    if (!date) return null;
    if (date instanceof Date) return date;

    const timestamp =
      typeof date === 'string' && /^\d+$/.test(date)
        ? parseInt(date, 10)
        : date;
    const parsed = new Date(timestamp);
    return isNaN(parsed.getTime()) ? null : parsed;
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

  onUpdate() {
    if (this.form.invalid) return;

    const rawDate = this.form.value.date_of_joining;
    const isoDate =
      rawDate instanceof Date
        ? rawDate.toISOString()
        : new Date(rawDate).toISOString();

    const input = {
      ...this.form.value,
      date_of_joining: isoDate,
    };

    this.apollo
      .mutate({
        mutation: UPDATE_EMPLOYEE,
        variables: {
          eid: this.data._id,
          input,
        },
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Employee updated successfully', 'Close', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Update error:', err);
          this.snackBar.open('Failed to update employee', 'Close', {
            duration: 3000,
          });
        },
      });
  }
}
