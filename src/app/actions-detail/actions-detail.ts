import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ActionsService } from '../core/actions.service';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';
import { AuthService } from '../core/auth.service';
import { SeoService } from '../core/seo.service';
import { Action } from '../models';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-actions-detail',
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ImgFallbackDirective,
  ],
  templateUrl: './actions-detail.html',
  styleUrl: './actions-detail.scss',
})
export class ActionsDetail implements OnInit {
  private readonly actionsService = inject(ActionsService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly action = signal<Action | null>(null);
  readonly content = computed(() =>
    this.action()?.description?.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ') ?? null,
  );

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id')!;
    try {
      const action = await this.actionsService.getAction(id);
      this.action.set(action);
      if (action) {
        this.seo.setPage({
          title: action.title,
          description: action.description ?? '',
          image: action.imageUrl,
        });
      }
    } finally {
      this.loading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/akcije']);
  }

  editAction(): void {
    this.router.navigate(['/akcije', this.action()!.id, 'uredi']);
  }

  async deleteAction(): Promise<void> {
    const action = this.action();
    if (!action) return;
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
      this.router.navigate(['/akcije']);
    } catch (e) {
      console.error('Delete action error:', e);
    }
  }
}
