import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CalendarService } from '../core/calendar.service';
import { CalendarEntry, CalendarEntryType } from '../models';

@Component({
  selector: 'app-calendar',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDividerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnInit {
  private readonly calendarService = inject(CalendarService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly showForm = signal(false);
  readonly entries = signal<CalendarEntry[]>([]);
  readonly entryTypes = signal<CalendarEntryType[]>([]);

  readonly entryForm = this.fb.group({
    title: ['', Validators.required],
    startTime: [null as Date | null, Validators.required],
    endTime: [null as Date | null],
    entryTypeId: ['', Validators.required],
    description: [''],
    location: [''],
  });

  async ngOnInit(): Promise<void> {
    try {
      const [entries, types] = await Promise.all([
        this.calendarService.listEntries(),
        this.calendarService.listEntryTypes(),
      ]);
      this.entries.set(entries);
      this.entryTypes.set(types);
    } catch {
      this.error.set('Грешка при учитавању.');
    } finally {
      this.loading.set(false);
    }
  }

  async createEntry(): Promise<void> {
    if (this.entryForm.invalid) { this.entryForm.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      const { title, startTime, endTime, entryTypeId, description, location } = this.entryForm.value;
      await this.calendarService.createEntry({
        title: title!,
        startTime: startTime!,
        entryTypeId: entryTypeId!,
        description: description || undefined,
        endTime: endTime || undefined,
        location: location || undefined,
      });
      this.entries.set(await this.calendarService.listEntries());
      this.entryForm.reset();
      this.showForm.set(false);
    } catch {
      this.error.set('Грешка при чувању уноса.');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteEntry(id: string): Promise<void> {
    await this.calendarService.deleteEntry(id);
    this.entries.update(list => list.filter(e => e.id !== id));
  }
}
