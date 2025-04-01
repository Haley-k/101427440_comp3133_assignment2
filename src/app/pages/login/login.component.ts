import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOGIN } from '../../graphql/queries';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
      <h2>Login</h2>
      <form [formGroup]="form" (ngSubmit)="onLogin()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" />
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit">Login</button>
      </form>

      <p class="switch-link">
        Don't have an account?
        <a routerLink="/signup">Sign up here</a>
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
export class LoginComponent {
  form: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    const { email, password } = this.form.value;

    this.apollo
      .watchQuery({
        query: LOGIN,
        variables: { email, password },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe({
        next: (res: any) => {
          const { token, message } = res.data.login;
          if (token) {
            localStorage.setItem('token', token);
            this.snackBar.open('Login successful', 'Close', { duration: 3000 });
            this.router.navigate(['/employees']);
          } else {
            this.snackBar.open(message, 'Close', { duration: 3000 });
          }
        },
        error: () => {
          this.snackBar.open('Login failed. Please try again.', 'Close', {
            duration: 3000,
          });
        },
      });
  }
}
