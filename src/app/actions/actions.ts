import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ActionsService } from '../core/actions.service';
import { AuthService } from '../core/auth.service';
import { Action } from '../models';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-actions',
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './actions.html',
  styleUrl: './actions.scss',
})
export class Actions implements OnInit {
  private readonly actionsService = inject(ActionsService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly searchQuery = signal('');
  readonly filteredActions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.actionsService.actions();
    return this.actionsService
      .actions()
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description ?? '').toLowerCase().includes(q) ||
          (a.location ?? '').toLowerCase().includes(q),
      );
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.actionsService.listActions();
    } catch (e) {
      console.error('Actions load error:', e);
      this.error.set('Грешка при учитавању акција.');
    } finally {
      this.loading.set(false);
    }
  }

  openAction(id: string): void {
    this.router.navigate(['/akcije', id]);
  }

  editAction(id: string): void {
    this.router.navigate(['/akcije', id, 'uredi']);
  }

  async deleteAction(action: Action, event: Event): Promise<void> {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Обриши акцију',
        message: `Да ли сте сигурни да желите да обришете "${action.title}"?`,
      },
    });
    const confirmed = await ref.afterClosed().toPromise();
    if (!confirmed) return;
    try {
      await this.actionsService.deleteAction(action.id);
    } catch (e) {
      console.error('Delete action error:', e);
    }
  }
}
