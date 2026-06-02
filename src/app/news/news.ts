import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class News implements OnInit {
  private readonly newsService = inject(NewsService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly searchQuery = signal('');
  readonly articles = signal<NewsArticle[]>([]);
  private readonly preferences = signal<Map<string, UserNewsPreference>>(new Map());

  readonly filteredArticles = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.articles();
    return this.articles().filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.sourceName ?? '').toLowerCase().includes(q) ||
      (a.summary ?? '').toLowerCase().includes(q),
    );
  });

  async ngOnInit(): Promise<void> {
    try {
      const [articles, prefs] = await Promise.all([
        this.newsService.listArticles(),
        this.auth.isLoggedIn() ? this.newsService.listUserPreferences() : Promise.resolve([]),
      ]);
      this.articles.set(articles);
      this.preferences.set(new Map(prefs.map(p => [p.newsArticleId, p])));
    } catch (e) {
      console.error('News load error:', e);
      this.error.set('Грешка при учитавању вести.');
    } finally {
      this.loading.set(false);
    }
  }

  openArticle(id: string): void {
    this.router.navigate(['/vesti', id]);
  }

  editArticle(id: string): void {
    this.router.navigate(['/vesti', id, 'uredi']);
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
