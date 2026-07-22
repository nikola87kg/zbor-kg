import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationsService, NotifType } from '../core/notifications.service';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [DatePipe, RouterLink, MatIconModule, MatProgressSpinnerModule, ImgFallbackDirective],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  private readonly svc = inject(NotificationsService);

  readonly loading = this.svc.loading;
  readonly error = signal('');
  readonly items = this.svc.items;

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
}
