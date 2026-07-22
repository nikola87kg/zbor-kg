import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideNativeDateAdapter } from '@angular/material/core';
import { QuillEditorComponent } from 'ngx-quill';
import { AffairsService } from '../core/affairs.service';
import { StorageService } from '../core/storage.service';
import { NotificationsService } from '../core/notifications.service';
import { Affair } from '../models';

@Component({
  selector: 'app-affairs-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    QuillEditorComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './affairs-form.html',
  styleUrl: './affairs-form.scss',
})
export class AffairsForm implements OnInit {
  private readonly affairsService = inject(AffairsService);
  private readonly storageService = inject(StorageService);
  private readonly notifSvc = inject(NotificationsService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly editingAffair = signal<Affair | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);

  readonly form = this.fb.group({
    title: ['', Validators.required],
    publishedAt: [new Date() as Date | null, Validators.required],
    content: [''],
  });

  readonly quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    try {
      if (id) {
        const affair = await this.affairsService.getAffair(id);
        if (affair) {
          this.editingAffair.set(affair);
          this.form.setValue({
            title: affair.title,
            publishedAt: new Date(affair.publishedAt),
            content: affair.content ?? '',
          });
          this.imagePreview.set(affair.imageUrl ?? null);
        }
      }
    } finally {
      this.loading.set(false);
    }
  }

  onFileSelected(file: File | undefined): void {
    if (!file) return;
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      let imageUrl: string | undefined;
      if (this.selectedFile()) {
        imageUrl = await this.storageService.uploadImage(this.selectedFile()!, 'affairs');
      } else if (this.imagePreview()) {
        imageUrl = this.imagePreview()!;
      }
      const { title, publishedAt, content } = this.form.value;
      const input = {
        title: title!,
        publishedAt: publishedAt!,
        content: content || undefined,
        imageUrl,
      };
      const editing = this.editingAffair();
      if (editing) {
        await this.affairsService.updateAffair(editing.id, input);
      } else {
        await this.affairsService.createAffair(input);
      }
      this.notifSvc.reload().catch(() => {});
      this.router.navigate(['/afere']);
    } catch (e) {
      console.error('AffairsForm submit error:', e);
      this.error.set('Грешка при чувању афере.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/afere']);
  }
}
