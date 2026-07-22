import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AffairsService } from '../core/affairs.service';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';
import { AuthService } from '../core/auth.service';
import { NotificationsService } from '../core/notifications.service';
import { SeoService } from '../core/seo.service';
import { Affair } from '../models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-affairs-detail',
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ImgFallbackDirective,
  ],
  templateUrl: './affairs-detail.html',
  styleUrl: './affairs-detail.scss',
})
export class AffairsDetail implements OnInit {
  private readonly affairsService = inject(AffairsService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notifSvc = inject(NotificationsService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly affair = signal<Affair | null>(null);
  readonly content = computed(() =>
    this.affair()?.content?.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ') ?? null,
  );

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id')!;
    try {
      const affair = await this.affairsService.getAffair(id);
      this.affair.set(affair);
      if (affair) {
        this.seo.setPage({
          title: affair.title,
          description: affair.content ?? '',
          image: affair.imageUrl,
        });
      }
    } finally {
      this.loading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/afere']);
  }

  editAffair(): void {
    this.router.navigate(['/afere', this.affair()!.id, 'uredi']);
  }

  async deleteAffair(): Promise<void> {
    const affair = this.affair();
    if (!affair) return;
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
      this.notifSvc.reload().catch(() => {});
      this.router.navigate(['/afere']);
    } catch (e) {
      console.error('Delete affair error:', e);
    }
  }
}
