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
import { ActionsService } from '../core/actions.service';
import { StorageService } from '../core/storage.service';
import { NotificationsService } from '../core/notifications.service';
import { Action } from '../models';

@Component({
  selector: 'app-actions-form',
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
  templateUrl: './actions-form.html',
  styleUrl: './actions-form.scss',
})
export class ActionsForm implements OnInit {
  private readonly actionsService = inject(ActionsService);
  private readonly storageService = inject(StorageService);
  private readonly notifSvc = inject(NotificationsService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly editingAction = signal<Action | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);

  readonly quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  readonly form = this.fb.group({
    title: ['', Validators.required],
    date: [new Date() as Date | null, Validators.required],
    location: [''],
    description: [''],
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    try {
      if (id) {
        const action = await this.actionsService.getAction(id);
        if (action) {
          this.editingAction.set(action);
          this.form.setValue({
            title: action.title,
            date: new Date(action.date),
            location: action.location ?? '',
            description: action.description ?? '',
          });
          this.imagePreview.set(action.imageUrl ?? null);
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
        imageUrl = await this.storageService.uploadImage(this.selectedFile()!, 'actions');
      } else if (this.imagePreview()) {
        imageUrl = this.imagePreview()!;
      }
      const { title, date, location, description } = this.form.value;
      const input = {
        title: title!,
        date: date!,
        location: location || undefined,
        description: description || undefined,
        imageUrl,
      };
      const editing = this.editingAction();
      if (editing) {
        await this.actionsService.updateAction(editing.id, input);
      } else {
        await this.actionsService.createAction(input);
      }
      this.notifSvc.reload().catch(() => {});
      this.router.navigate(['/akcije']);
    } catch (e) {
      console.error('ActionsForm submit error:', e);
      this.error.set('Грешка при чувању акције.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/akcije']);
  }
}
