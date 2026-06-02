export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  publishedAt: Date;
  createdAt: Date;
  imageUrl?: string | null;
  summary?: string | null;
  sourceName?: string | null;
}

export interface UserNewsPreference {
  newsArticleId: string;
  isRead?: boolean | null;
  isFavorite?: boolean | null;
}

export interface CalendarEntryType {
  id: string;
  name: string;
}

export interface CalendarEntry {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date | null;
  description?: string | null;
  location?: string | null;
  isAllDay?: boolean | null;
  entryType: CalendarEntryType;
}

export interface CreateNewsArticleInput {
  title: string;
  url: string;
  publishedAt: Date;
  imageUrl?: string;
  summary?: string;
  sourceName?: string;
}

export interface CreateCalendarEntryInput {
  title: string;
  startTime: Date;
  entryTypeId: string;
  description?: string;
  endTime?: Date;
  location?: string;
  isAllDay?: boolean;
}
