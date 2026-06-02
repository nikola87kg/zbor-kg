import { Injectable, inject } from '@angular/core';
import { executeQuery, executeMutation, queryRef, mutationRef } from 'firebase/data-connect';
import { FIREBASE_DATA_CONNECT } from '../firebase';
import { NewsArticle, UserNewsPreference } from '../models';

interface ListNewsData { newsArticles: NewsArticle[] }
interface ListPrefsData { userNewsPreferences: UserNewsPreference[] }
interface SetPrefVars { newsArticleId: string; isFavorite: boolean; isRead: boolean }

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly dc = inject(FIREBASE_DATA_CONNECT);

  async listArticles(): Promise<NewsArticle[]> {
    const ref = queryRef<ListNewsData>(this.dc, 'ListNewsArticles');
    const { data } = await executeQuery(ref);
    return data.newsArticles;
  }

  async listUserPreferences(): Promise<UserNewsPreference[]> {
    const ref = queryRef<ListPrefsData>(this.dc, 'ListUserNewsPreferences');
    const { data } = await executeQuery(ref);
    return data.userNewsPreferences;
  }

  async setPreference(newsArticleId: string, isFavorite: boolean, isRead: boolean): Promise<void> {
    const ref = mutationRef<void, SetPrefVars>(
      this.dc,
      'SetNewsPreference',
      { newsArticleId, isFavorite, isRead },
    );
    await executeMutation(ref);
  }
}
