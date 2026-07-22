import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NewsService } from '../core/news.service';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';
import { SeoService } from '../core/seo.service';
import { NewsArticle } from '../models';

@Component({
  selector: 'app-news-detail',
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ImgFallbackDirective,
  ],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.scss',
})
export class NewsDetail implements OnInit {
  private readonly newsService = inject(NewsService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly article = signal<NewsArticle | null>(null);
  readonly content = computed(() =>
    this.article()?.summary?.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ') ?? null,
  );

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id')!;
    try {
      const article = await this.newsService.getArticle(id);
      this.article.set(article);
      if (article) {
        this.seo.setPage({
          title: article.title,
          description: article.summary ?? '',
          image: article.imageUrl,
        });
      }
    } finally {
      this.loading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/vesti']);
  }
}
