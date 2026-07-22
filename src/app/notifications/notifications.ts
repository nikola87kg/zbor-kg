import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationsService, NotifType } from '../core/notifications.service';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [DatePipe, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, ImgFallbackDirective],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  private readonly svc = inject(NotificationsService);

  readonly loading = this.svc.loading;
  readonly error = signal('');
  readonly items = this.svc.items;

  readonly currentPage = signal(0);
  readonly totalPages = computed(() => Math.ceil(this.items().length / PAGE_SIZE));
  readonly paginatedItems = computed(() => {
    const p = this.currentPage();
    return this.items().slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE);
  });

  readonly typeLabels: Record<NotifType, string> = {
    news: 'Вест',
    affair: 'Афера',
    action: 'Акција',
    report: 'Пријава',
    status: 'Статус',
  };

  async ngOnInit(): Promise<void> {
    try {
      await this.svc.reload();
    } catch (e) {
      console.error('Notifications load error:', e);
      this.error.set('Грешка при учитавању обавештења.');
    }
  }

  prevPage(): void {
    this.currentPage.update(p => Math.max(0, p - 1));
  }

  nextPage(): void {
    this.currentPage.update(p => Math.min(this.totalPages() - 1, p + 1));
  }
}
