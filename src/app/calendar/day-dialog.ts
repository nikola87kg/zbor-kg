import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/auth.service';
import { Action } from '../models';

export interface DayDialogData {
  date: Date;
  dateLabel: string;
  actions: Action[];
}

@Component({
  selector: 'app-day-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ data.dateLabel }}</h2>

    <mat-dialog-content class="dialog-body">
      @if (data.actions.length === 0) {
        <p class="no-events">Нема догађаја за овај дан.</p>
      } @else {
        @for (action of data.actions; track action.id) {
          <div class="event-item" (click)="openAction(action.id)">
            <div class="event-dot"></div>
            <div class="event-info">
              <span class="event-title">{{ action.title }}</span>
              @if (action.location) {
                <span class="event-location">
                  <mat-icon class="loc-icon">place</mat-icon>{{ action.location }}
                </span>
              }
            </div>
            <mat-icon class="arrow-icon">chevron_right</mat-icon>
          </div>
        }
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Затвори</button>
      @if (auth.isLoggedIn()) {
        <button mat-flat-button (click)="createAction()">
          <mat-icon>add</mat-icon>
          Додај акцију
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-body {
        min-width: 280px;
        padding-top: 4px;
        padding-bottom: 4px;
      }

      .no-events {
        color: var(--mat-sys-on-surface-variant);
        font-size: 14px;
        margin: 8px 0 16px;
      }

      .event-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 8px;
        margin: 0 -8px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.15s;

        &:not(:last-child) {
          border-bottom: 1px solid var(--mat-sys-outline-variant);
          border-radius: 0;
        }

        &:hover {
          background: var(--mat-sys-surface-variant);
        }
      }

      .event-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid var(--mat-sys-error);
        flex-shrink: 0;
      }

      .event-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
      }

      .event-title {
        font-size: 14px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .event-location {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .loc-icon {
        font-size: 13px;
        height: 13px;
        width: 13px;
      }

      .arrow-icon {
        font-size: 20px;
        color: var(--mat-sys-on-surface-variant);
        flex-shrink: 0;
      }
    `,
  ],
})
export class DayDialog {
  readonly data = inject<DayDialogData>(MAT_DIALOG_DATA);
  readonly auth = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<DayDialog>);
  private readonly router = inject(Router);

  openAction(id: string): void {
    this.dialogRef.close();
    this.router.navigate(['/akcije', id]);
  }

  createAction(): void {
    this.dialogRef.close();
    const d = this.data.date;
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.router.navigate(['/akcije/nova'], { queryParams: { date: iso } });
  }
}
