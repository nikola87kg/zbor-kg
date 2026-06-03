import { Injectable, inject, signal } from '@angular/core';
import { executeQuery, executeMutation, queryRef, mutationRef } from 'firebase/data-connect';
import { FIREBASE_DATA_CONNECT } from '../firebase';
import { NewsArticle, UserNewsPreference, CreateNewsArticleInput } from '../models';

interface ListNewsData { newsArticles: NewsArticle[] }
interface GetNewsData { newsArticle: NewsArticle | null }
interface ListPrefsData { userNewsPreferences: UserNewsPreference[] }
interface SetPrefVars { newsArticleId: string; isFavorite: boolean; isRead: boolean }
interface CreateArticleData { newsArticle_insert: { id: string } }
interface UpdateArticleVars extends CreateNewsArticleInput { id: string }

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly dc = inject(FIREBASE_DATA_CONNECT);

  private readonly _articles = signal<NewsArticle[]>([]);
  private _loaded = false;

  /** Reactive list — always up-to-date after any mutation. */
  readonly articles = this._articles.asReadonly();

  async listArticles(): Promise<void> {
    if (this._loaded) return;
    const ref = queryRef<ListNewsData>(this.dc, 'ListNewsArticles');
    const { data } = await executeQuery(ref);
    this._articles.set(data.newsArticles ?? []);
    this._loaded = true;
  }

  async getArticle(id: string): Promise<NewsArticle | null> {
    const cached = this._articles().find(a => a.id === id);
    if (cached) return cached;
    const ref = queryRef<GetNewsData, { id: string }>(this.dc, 'GetNewsArticle', { id });
    const { data } = await executeQuery(ref);
    return data.newsArticle;
  }

  async createArticle(input: CreateNewsArticleInput): Promise<string> {
    const ref = mutationRef<CreateArticleData, CreateNewsArticleInput>(
      this.dc, 'CreateNewsArticle', input,
    );
    const { data } = await executeMutation(ref);
    const id = data.newsArticle_insert.id;
    const newArticle: NewsArticle = {
      id,
      title: input.title,
      url: input.url,
      publishedAt: input.publishedAt,
      createdAt: new Date(),
      sourceName: input.sourceName ?? null,
      summary: input.summary ?? null,
      imageUrl: input.imageUrl ?? null,
    };
    this._articles.update(list => [newArticle, ...list]);
    this._loaded = true;
    return id;
  }

  async updateArticle(id: string, input: CreateNewsArticleInput): Promise<void> {
    const ref = mutationRef<void, UpdateArticleVars>(
      this.dc, 'UpdateNewsArticle', { id, ...input },
    );
    await executeMutation(ref);
    this._articles.update(list => list.map(a => (a.id === id ? { ...a, ...input } : a)));
  }

  async deleteArticle(id: string): Promise<void> {
    const ref = mutationRef<void, { id: string }>(this.dc, 'DeleteNewsArticle', { id });
    await executeMutation(ref);
    this._articles.update(list => list.filter(a => a.id !== id));
  }

  async listUserPreferences(): Promise<UserNewsPreference[]> {
    const ref = queryRef<ListPrefsData>(this.dc, 'ListUserNewsPreferences');
    const { data } = await executeQuery(ref);
    return data.userNewsPreferences;
  }

  async setPreference(newsArticleId: string, isFavorite: boolean, isRead: boolean): Promise<void> {
    const ref = mutationRef<void, SetPrefVars>(
      this.dc, 'SetNewsPreference', { newsArticleId, isFavorite, isRead },
    );
    await executeMutation(ref);
  }
}
