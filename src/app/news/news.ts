import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { NewsService } from '../core/news.service';
import { AuthService } from '../core/auth.service';
import { NewsArticle, UserNewsPreference } from '../models';

@Component({
  selector: 'app-news',
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class News implements OnInit {
  private readonly newsService = inject(NewsService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly articles = signal<NewsArticle[]>([]);
  private readonly preferences = signal<Map<string, UserNewsPreference>>(new Map());

  async ngOnInit(): Promise<void> {
    try {
      const [articles, prefs] = await Promise.all([
        this.newsService.listArticles(),
        this.auth.isLoggedIn() ? this.newsService.listUserPreferences() : Promise.resolve([]),
      ]);
      this.articles.set(articles);
      this.preferences.set(new Map(prefs.map(p => [p.newsArticleId, p])));
    } catch {
      this.error.set('Грешка при учитавању вести.');
    } finally {
      this.loading.set(false);
    }
  }

  isFavorite(articleId: string): boolean {
    return this.preferences().get(articleId)?.isFavorite ?? false;
  }

  async toggleFavorite(articleId: string): Promise<void> {
    const current = this.preferences().get(articleId);
    const isFavorite = !(current?.isFavorite ?? false);
    const isRead = current?.isRead ?? false;
    await this.newsService.setPreference(articleId, isFavorite, isRead);
    const map = new Map(this.preferences());
    map.set(articleId, { newsArticleId: articleId, isFavorite, isRead });
    this.preferences.set(map);
  }
}
