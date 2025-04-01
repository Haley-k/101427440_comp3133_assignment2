import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Router, RouterModule } from '@angular/router';
import { SIGNUP } from '../../graphql/queries';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-card class="auth-card">
      <h2>Sign Up</h2>
      <form [formGroup]="form" (ngSubmit)="onSignup()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" />
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit">Sign Up</button>
      </form>

      <p class="switch-link">
        Already have an account?
        <a routerLink="/login">Login here</a>
      </p>
    </mat-card>
  `,
  styles: [
    `
      .auth-card {
        max-width: 400px;
        margin: 5rem auto;
        padding: 2rem;
      }
      .full-width {
        width: 100%;
      }
      .switch-link {
        margin-top: 1rem;
      }
    `,
  ],
})
export class SignupComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSignup() {
    const { username, email, password } = this.form.value;

    this.apollo
      .mutate({
        mutation: SIGNUP,
        variables: { username, email, password },
      })
      .subscribe({
        next: (res: any) => {
          const { token, message } = res.data.signup;
          if (token) {
            localStorage.setItem('token', token);
            this.snackBar.open('Signup successful', 'Close', {
              duration: 3000,
            });
            this.router.navigate(['/employees']);
          } else {
            this.snackBar.open(message, 'Close', { duration: 3000 });
          }
        },
        error: () => {
          this.snackBar.open('Signup failed. Please try again.', 'Close', {
            duration: 3000,
          });
        },
      });
  }
}
