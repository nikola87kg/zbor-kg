import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportsService } from '../core/reports.service';
import { ProblemReport } from '../models';

@Component({
  selector: 'app-reports-list',
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.scss',
})
export class ReportsList implements OnInit {
  private readonly reportsService = inject(ReportsService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly reports = signal<ProblemReport[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      const reports = await this.reportsService.listReports();
      this.reports.set(reports);
    } catch (e) {
      console.error('Reports load error:', e);
      this.error.set('Грешка при учитавању пријава.');
    } finally {
      this.loading.set(false);
    }
  }
}
