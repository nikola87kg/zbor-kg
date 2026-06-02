import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideNativeDateAdapter } from '@angular/material/core';
import { QuillEditorComponent } from 'ngx-quill';
import { NewsService } from '../core/news.service';
import { StorageService } from '../core/storage.service';
import { NewsArticle } from '../models';

@Component({
  selector: 'app-news-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    QuillEditorComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './news-form.html',
  styleUrl: './news-form.scss',
})
export class NewsForm implements OnInit {
  private readonly newsService = inject(NewsService);
  private readonly storageService = inject(StorageService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly editingArticle = signal<NewsArticle | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);

  private articles: NewsArticle[] = [];

  readonly form = this.fb.group({
    title: ['', Validators.required],
    url: ['', Validators.required],
    publishedAt: [new Date() as Date | null, Validators.required],
    sourceName: [''],
    summary: [''],
  });

  readonly quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    try {
      this.articles = await this.newsService.listArticles();
      if (id) {
        const article = this.articles.find(a => a.id === id)
          ?? await this.newsService.getArticle(id);
        if (article) {
          this.editingArticle.set(article);
          this.form.setValue({
            title: article.title,
            url: article.url,
            publishedAt: new Date(article.publishedAt),
            sourceName: article.sourceName ?? '',
            summary: article.summary ?? '',
          });
          this.imagePreview.set(article.imageUrl ?? null);
        }
      }
    } finally {
      this.loading.set(false);
    }
  }

  onFileSelected(file: File | undefined): void {
    if (!file) return;
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = e => this.imagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  generateSlug(): void {
    const title = this.form.get('title')?.value?.trim();
    if (!title) return;
    const base = this.toSlug(title);
    const existingUrls = new Set(
      this.articles.filter(a => a.id !== this.editingArticle()?.id).map(a => a.url),
    );
    let slug = `/vesti/${base}`;
    if (existingUrls.has(slug)) {
      const date = this.form.get('publishedAt')?.value as Date | null;
      const suffix = date
        ? `-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        : `-${Date.now()}`;
      slug = `/vesti/${base}${suffix}`;
    }
    this.form.get('url')?.setValue(slug);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      let imageUrl: string | undefined;
      if (this.selectedFile()) {
        imageUrl = await this.storageService.uploadImage(this.selectedFile()!, 'news');
      } else if (this.imagePreview()) {
        imageUrl = this.imagePreview()!;
      }
      const { title, url, publishedAt, sourceName, summary } = this.form.value;
      const input = {
        title: title!,
        url: url!,
        publishedAt: publishedAt!,
        sourceName: sourceName || undefined,
        summary: summary || undefined,
        imageUrl,
      };
      const editing = this.editingArticle();
      if (editing) {
        await this.newsService.updateArticle(editing.id, input);
      } else {
        await this.newsService.createArticle(input);
      }
      this.router.navigate(['/vesti']);
    } catch (e) {
      console.error('NewsForm submit error:', e);
      this.error.set('Грешка при чувању вести.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/vesti']);
  }

  private toSlug(text: string): string {
    const cyr: Record<string, string> = {
      'а':'a','б':'b','в':'v','г':'g','д':'d','ђ':'dj','е':'e','ж':'zh',
      'з':'z','и':'i','ј':'j','к':'k','л':'l','љ':'lj','м':'m','н':'n',
      'њ':'nj','о':'o','п':'p','р':'r','с':'s','т':'t','ћ':'c','у':'u',
      'ф':'f','х':'h','ц':'c','ч':'ch','џ':'dz','ш':'sh',
    };
    return text.toLowerCase().split('').map(c => cyr[c] ?? c).join('')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
}
