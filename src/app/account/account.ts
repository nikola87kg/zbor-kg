import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../core/auth.service';
import { StorageService } from '../core/storage.service';

export interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  dateOfBirth: string;
}

const PROFILE_KEY = (uid: string) => `user_profile_${uid}`;

@Component({
  selector: 'app-account',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly storage = inject(StorageService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly photoPreview = signal<string | null>(null);
  private selectedFile: File | null = null;
  private populated = false;

  readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required],
    dateOfBirth: [null as Date | null],
  });

  constructor() {
    // Populate form once the user signal is available (Firebase auth restores async)
    effect(() => {
      const user = this.auth.user();
      if (!user || this.populated) return;
      this.populated = true;

      this.photoPreview.set(user.photoURL);

      const saved = localStorage.getItem(PROFILE_KEY(user.uid));
      if (saved) {
        const profile: UserProfile = JSON.parse(saved);
        this.form.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          username: profile.username,
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
        });
      } else if (user.displayName) {
        const parts = user.displayName.split(' ');
        this.form.patchValue({
          firstName: parts[0] ?? '',
          lastName: parts.slice(1).join(' '),
        });
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.photoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.selectedFile = null;
    this.photoPreview.set(null);
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const user = this.auth.user();
    if (!user) return;

    this.loading.set(true);
    try {
      const { firstName, lastName, username, dateOfBirth } = this.form.value;

      let photoURL: string | null = user.photoURL;
      if (this.selectedFile) {
        photoURL = await this.storage.uploadImage(this.selectedFile, `users/${user.uid}`);
      } else if (this.photoPreview() === null) {
        photoURL = null;
      }

      const displayName = `${firstName} ${lastName}`.trim();
      await this.auth.updateUserProfile({ displayName, photoURL });

      const profile: UserProfile = {
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        username: username ?? '',
        dateOfBirth: dateOfBirth ? (dateOfBirth as Date).toISOString() : '',
      };
      localStorage.setItem(PROFILE_KEY(user.uid), JSON.stringify(profile));

      this.snackBar.open('Profil uspešno sačuvan.', 'OK', { duration: 3000 });
    } catch (e) {
      console.error('[Account] onSave error:', e);
      this.snackBar.open('Greška pri čuvanju profila.', 'OK', { duration: 4000 });
    } finally {
      this.loading.set(false);
    }
  }
}
