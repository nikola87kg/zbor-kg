import { Injectable, inject } from '@angular/core';
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

  async listArticles(): Promise<NewsArticle[]> {
    const ref = queryRef<ListNewsData>(this.dc, 'ListNewsArticles');
    const { data } = await executeQuery(ref);
    return data.newsArticles;
  }

  async getArticle(id: string): Promise<NewsArticle | null> {
    const ref = queryRef<GetNewsData, { id: string }>(this.dc, 'GetNewsArticle', { id });
    const { data } = await executeQuery(ref);
    return data.newsArticle;
  }

  async createArticle(input: CreateNewsArticleInput): Promise<string> {
    const ref = mutationRef<CreateArticleData, CreateNewsArticleInput>(
      this.dc, 'CreateNewsArticle', input,
    );
    const { data } = await executeMutation(ref);
    return data.newsArticle_insert.id;
  }

  async updateArticle(id: string, input: CreateNewsArticleInput): Promise<void> {
    const ref = mutationRef<void, UpdateArticleVars>(
      this.dc, 'UpdateNewsArticle', { id, ...input },
    );
    await executeMutation(ref);
  }

  async listUserPreferences(): Promise<UserNewsPreference[]> {
    const ref = queryRef<ListPrefsData>(this.dc, 'ListUserNewsPreferences');
    const { data } = await executeQuery(ref);
    return data.userNewsPreferences;
  }

  async deleteArticle(id: string): Promise<void> {
    const ref = mutationRef<void, { id: string }>(this.dc, 'DeleteNewsArticle', { id });
    await executeMutation(ref);
  }

  async setPreference(newsArticleId: string, isFavorite: boolean, isRead: boolean): Promise<void> {
    const ref = mutationRef<void, SetPrefVars>(
      this.dc, 'SetNewsPreference', { newsArticleId, isFavorite, isRead },
    );
    await executeMutation(ref);
  }
}
