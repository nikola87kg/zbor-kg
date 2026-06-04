import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportsService } from '../core/reports.service';
import { StorageService } from '../core/storage.service';

@Component({
  selector: 'app-report',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './report.html',
  styleUrl: './report.scss',
})
export class Report {
  private readonly reportsService = inject(ReportsService);
  private readonly storageService = inject(StorageService);
  private readonly fb = inject(FormBuilder);

  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly error = signal('');
  readonly selectedFile = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    description: ['', Validators.required],
  });

  onFileSelected(file: File | undefined): void {
    if (!file) return;
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = e => this.imagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set('');
    try {
      let imageUrl: string | undefined;
      if (this.selectedFile()) {
        imageUrl = await this.storageService.uploadImage(this.selectedFile()!, 'reports');
      }
      const { name, address, description } = this.form.value;
      await this.reportsService.submitReport({
        name: name!,
        address: address!,
        description: description!,
        imageUrl,
      });
      this.submitted.set(true);
    } catch (e) {
      console.error('Report submit error:', e);
      this.error.set('Грешка при слању пријаве. Покушајте поново.');
    } finally {
      this.saving.set(false);
    }
  }

  reset(): void {
    this.form.reset();
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.submitted.set(false);
  }
}
