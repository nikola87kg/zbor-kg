import { Component, OnInit, OnDestroy, inject, output, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
import { NotificationsService, NotifType } from '../core/notifications.service';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';

const STORAGE_KEY = 'notif_cleared_at';

@Component({
  selector: 'app-toolbar',
  imports: [
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
export class Toolbar implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly notifSvc = inject(NotificationsService);
  readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly menuToggle = output();

  readonly notifLoading = this.notifSvc.loading;

  private readonly clearedAt = signal<number>(
    isPlatformBrowser(this.platformId)
      ? Number(localStorage.getItem(STORAGE_KEY) ?? '0')
      : 0,
  );

  readonly newItems = computed(() => {
    const cutoff = this.clearedAt();
    return this.notifSvc.items().filter(i => i.date.getTime() > cutoff);
  });

  readonly recentItems = computed(() => this.newItems().slice(0, 3));
  readonly newCount = computed(() => this.newItems().length);

  readonly typeLabels: Record<NotifType, string> = {
    news: 'нова вест',
    affair: 'нова афера',
    action: 'нова акција',
    report: 'пријава проблема',
    status: 'промена статуса',
  };

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  async ngOnInit(): Promise<void> {
    await this.notifSvc.load();
    if (isPlatformBrowser(this.platformId)) {
      this.pollInterval = setInterval(() => this.notifSvc.reload().catch(() => { }), 60_000);
    }
  }

  ngOnDestroy(): void {
    if (this.pollInterval !== null) {
      clearInterval(this.pollInterval);
    }
  }

  clearNotifs(): void {
    const now = Date.now();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, String(now));
    }
    this.clearedAt.set(now);
  }

  onBellOpened(): void {
    this.notifSvc.reload().catch(() => { });
  }

  goToNotifs(): void {
    this.router.navigate(['/obavestenja']);
  }

  logout(): void {
    this.auth.logout().catch(console.error);
  }
}
