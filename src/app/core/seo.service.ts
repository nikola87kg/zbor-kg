import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

const SITE_NAME = 'Збор КГ';
const DEFAULT_DESCRIPTION = 'Грађански надзор Крагујевац – вести, афере и акције.';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly doc = inject(DOCUMENT);

  setPage(opts: { title: string; description?: string; image?: string | null; url?: string }): void {
    const origin = this.doc.location.origin;
    const fullTitle = `${opts.title} | ${SITE_NAME}`;
    const description = opts.description ? this.strip(opts.description) : DEFAULT_DESCRIPTION;
    const image = opts.image || `${origin}/images/zbor-logo.png`;
    const url = opts.url || this.doc.location.href;

    this.title.setTitle(fullTitle);

    // Standard
    this.meta.updateTag({ name: 'description', content: description });

    // Open Graph
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });

    // Twitter / X
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  reset(): void {
    this.title.setTitle(SITE_NAME);
    this.meta.updateTag({ name: 'description', content: DEFAULT_DESCRIPTION });
    this.meta.updateTag({ property: 'og:title', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:description', content: DEFAULT_DESCRIPTION });
    this.meta.updateTag({ property: 'og:image', content: `${this.doc.location.origin}/images/zbor-logo.png` });
    this.meta.updateTag({ property: 'og:url', content: this.doc.location.origin });
  }

  private strip(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z#0-9]+;/gi, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 200);
  }
}
