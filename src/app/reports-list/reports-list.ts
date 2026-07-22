import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/auth.service';
import { ReportsService } from '../core/reports.service';
import { ProblemReport } from '../models';

export const REPORT_STATUSES = ['На разматрању', 'Покренут поступак', 'Решен проблем'] as const;

@Component({
  selector: 'app-reports-list',
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.scss',
})
export class ReportsList implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly reports = signal<ProblemReport[]>([]);
  readonly isAdmin = this.authService.isAdmin;
  readonly statuses = REPORT_STATUSES;

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

  async setStatus(report: ProblemReport, status: string): Promise<void> {
    if (report.status === status) return;
    await this.reportsService.updateStatus(report.id, status);
    this.reports.update(list => list.map(r => r.id === report.id ? { ...r, status } : r));
  }

  statusClass(report: ProblemReport): string {
    switch (report.status) {
      case 'Покренут поступак': return 'status-in-progress';
      case 'Решен проблем': return 'status-resolved';
      default: return 'status-pending';
    }
  }

  statusIcon(report: ProblemReport): string {
    switch (report.status) {
      case 'Покренут поступак': return 'pending_actions';
      case 'Решен проблем': return 'check_circle';
      default: return 'schedule';
    }
  }
}
