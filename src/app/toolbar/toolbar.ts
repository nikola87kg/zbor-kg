import { Component, OnInit, inject, output, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';
import { NotificationsService } from '../core/notifications.service';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';

const STORAGE_KEY = 'notif_cleared_at';

@Component({
  selector: 'app-toolbar',
  imports: [
    DatePipe,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    ImgFallbackDirective,
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar implements OnInit {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly notifSvc = inject(NotificationsService);
  private readonly router = inject(Router);

  readonly menuToggle = output();

  readonly notifLoading = this.notifSvc.loading;

  private readonly clearedAt = signal<number>(
    Number(typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) ?? '0') : '0'),
  );

  readonly newItems = computed(() => {
    const cutoff = this.clearedAt();
    return this.notifSvc.items().filter(i => i.date.getTime() > cutoff);
  });

  readonly recentItems = computed(() => this.newItems().slice(0, 3));
  readonly newCount = computed(() => this.newItems().length);

  async ngOnInit(): Promise<void> {
    await this.notifSvc.load();
  }

  clearNotifs(): void {
    const now = Date.now();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(now));
    }
    this.clearedAt.set(now);
  }

  goToNotifs(): void {
    this.router.navigate(['/obavestenja']);
  }

  logout(): void {
    this.auth.logout().catch(console.error);
  }
}
