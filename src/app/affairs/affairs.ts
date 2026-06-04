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
import { AffairsService } from '../core/affairs.service';
import { AuthService } from '../core/auth.service';
import { Affair } from '../models';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';
import { StripHtmlPipe } from '../core/strip-html.pipe';

@Component({
  selector: 'app-affairs',
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
    StripHtmlPipe,
  ],
  templateUrl: './affairs.html',
  styleUrl: './affairs.scss',
})
export class Affairs implements OnInit {
  private readonly affairsService = inject(AffairsService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly searchQuery = signal('');
  readonly filteredAffairs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.affairsService.affairs();
    return this.affairsService
      .affairs()
      .filter(
        (a) => a.title.toLowerCase().includes(q) || (a.content ?? '').toLowerCase().includes(q),
      );
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.affairsService.listAffairs();
    } catch (e) {
      console.error('Affairs load error:', e);
      this.error.set('Грешка при учитавању афера.');
    } finally {
      this.loading.set(false);
    }
  }

  openAffair(id: string): void {
    this.router.navigate(['/afere', id]);
  }

  editAffair(id: string): void {
    this.router.navigate(['/afere', id, 'uredi']);
  }

  async deleteAffair(affair: Affair, event: Event): Promise<void> {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Обриши аферу',
        message: `Да ли сте сигурни да желите да обришете "${affair.title}"?`,
      },
    });
    const confirmed = await ref.afterClosed().toPromise();
    if (!confirmed) return;
    try {
      await this.affairsService.deleteAffair(affair.id);
    } catch (e) {
      console.error('Delete affair error:', e);
    }
  }
}
