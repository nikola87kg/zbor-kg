import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
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
import { NewsService } from '../core/news.service';
import { AuthService } from '../core/auth.service';
import { NewsArticle, UserNewsPreference } from '../models';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';

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
  private readonly dialog = inject(MatDialog);
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

  constructor() {
    // Preferencije se učitavaju reaktivno — odvojeno od vesti
    // da auth token grešla ne blokira prikaz vesti
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.newsService.listUserPreferences()
          .then(prefs => this.preferences.set(new Map(prefs.map(p => [p.newsArticleId, p]))))
          .catch(e => console.error('Preferences load error:', e));
      } else {
        this.preferences.set(new Map());
      }
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.articles.set(await this.newsService.listArticles());
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

  async deleteArticle(article: NewsArticle, event: Event): Promise<void> {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialog, {
      data: { title: 'Обриши вест', message: `Да ли сте сигурни да желите да обришете "${article.title}"?` },
    });
    const confirmed = await ref.afterClosed().toPromise();
    if (!confirmed) return;
    try {
      await this.newsService.deleteArticle(article.id);
      this.articles.update(list => list.filter(a => a.id !== article.id));
    } catch (e) {
      console.error('Delete article error:', e);
    }
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
