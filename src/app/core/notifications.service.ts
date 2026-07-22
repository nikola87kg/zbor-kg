import { Injectable, inject, signal } from '@angular/core';
import { executeQuery, queryRef } from 'firebase/data-connect';
import { FIREBASE_DATA_CONNECT } from '../firebase';
import { NewsArticle, Affair, Action, ProblemReport, StatusLog } from '../models';

export type NotifType = 'news' | 'affair' | 'action' | 'report' | 'status';

export interface NotificationItem {
  id: string;
  type: NotifType;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  date: Date;
  routerLink: string[];
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly dc = inject(FIREBASE_DATA_CONNECT);

  private _loaded = false;
  private readonly _items = signal<NotificationItem[]>([]);
  readonly loading = signal(false);

  /** Reactive list — populated after load(). */
  readonly items = this._items.asReadonly();

  async load(): Promise<void> {
    if (this._loaded) return;
    this.loading.set(true);
    try {
      const items = await this._fetchAll();
      this._items.set(items);
      this._loaded = true;
    } finally {
      this.loading.set(false);
    }
  }

  /** Force a fresh fetch (e.g. after navigating to the full page). */
  async reload(): Promise<void> {
    this._loaded = false;
    await this.load();
  }

  private async _fetchAll(): Promise<NotificationItem[]> {
    const [news, affairs, actions, reports, statusLogs] = await Promise.all([
      executeQuery(queryRef<{ newsArticles: NewsArticle[] }>(this.dc, 'ListNewsArticles')).then(r => r.data.newsArticles ?? []),
      executeQuery(queryRef<{ affairs: Affair[] }>(this.dc, 'ListAffairs')).then(r => r.data.affairs ?? []),
      executeQuery(queryRef<{ actions: Action[] }>(this.dc, 'ListActions')).then(r => r.data.actions ?? []),
      executeQuery(queryRef<{ problemReports: ProblemReport[] }>(this.dc, 'ListReports')).then(r => r.data.problemReports ?? []),
      executeQuery(queryRef<{ problemStatusLogs: StatusLog[] }>(this.dc, 'ListStatusLogs')).then(r => r.data.problemStatusLogs ?? []),
    ]);

    const items: NotificationItem[] = [
      ...news.map(a => ({ id: 'news-' + a.id, type: 'news' as NotifType, title: a.title, imageUrl: a.imageUrl, date: new Date(a.publishedAt), routerLink: ['/vesti', a.id] })),
      ...affairs.map(a => ({ id: 'affair-' + a.id, type: 'affair' as NotifType, title: a.title, imageUrl: a.imageUrl, date: new Date(a.publishedAt), routerLink: ['/afere', a.id] })),
      ...actions.map(a => ({ id: 'action-' + a.id, type: 'action' as NotifType, title: a.title, imageUrl: a.imageUrl, date: new Date(a.createdAt), routerLink: ['/akcije', a.id] })),
      ...reports.map(r => ({ id: 'report-' + r.id, type: 'report' as NotifType, title: r.address, subtitle: r.name || 'Анонимно', imageUrl: r.imageUrl, date: new Date(r.createdAt), routerLink: ['/prijavljeni-problemi'] })),
      ...statusLogs.map(l => ({ id: 'status-' + l.id, type: 'status' as NotifType, title: l.report.address, subtitle: l.status, imageUrl: l.report.imageUrl, date: new Date(l.changedAt), routerLink: ['/prijavljeni-problemi'] })),
    ];

    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
