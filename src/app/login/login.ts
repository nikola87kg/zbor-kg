import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly hideLogin = signal(true);
  readonly hideSignup = signal(true);
  readonly loginError = signal('');
  readonly signupError = signal('');
  readonly loading = signal(false);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly signupForm = this.fb.group({
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loginError.set('');
    this.loading.set(true);
    try {
      const { email, password } = this.loginForm.value;
      await this.authService.login(email!, password!);
      this.router.navigate(['/vesti']);
    } catch (e: any) {
      this.loginError.set(this.errorMessage(e.code));
    } finally {
      this.loading.set(false);
    }
  }

  async onSignup(): Promise<void> {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    const { displayName, email, password, confirmPassword } = this.signupForm.value;
    if (password !== confirmPassword) {
      this.signupError.set('Лозинке се не поклапају.');
      return;
    }
    this.signupError.set('');
    this.loading.set(true);
    try {
      await this.authService.register(displayName!, email!, password!);
      this.router.navigate(['/vesti']);
    } catch (e: any) {
      this.signupError.set(this.errorMessage(e.code));
    } finally {
      this.loading.set(false);
    }
  }

  private errorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Погрешна е-пошта или лозинка.';
      case 'auth/email-already-in-use':
        return 'Та е-пошта се користи.';
      case 'auth/invalid-email':
        return 'Неважећа е-пошта адреса.';
      case 'auth/weak-password':
        return 'Лозинка прекратка (мин. 6 карактера).';
      case 'auth/too-many-requests':
        return 'Приступ привремено блокиран.';
      case 'auth/user-disabled':
        return 'Налог деактивиран.';
      default:
        return 'Грешка. Покушати поново.';
    }
  }
}
