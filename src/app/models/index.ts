export interface NewsArticle {
  id: string;
  title: string;
  publishedAt: Date;
  createdAt: Date;
  imageUrl?: string | null;
  summary?: string | null;
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
  publishedAt: Date;
  imageUrl?: string;
  summary?: string;
}

export interface Affair {
  id: string;
  title: string;
  publishedAt: Date;
  createdAt: Date;
  content?: string | null;
  imageUrl?: string | null;
}

export interface CreateAffairInput {
  title: string;
  publishedAt: Date;
  content?: string;
  imageUrl?: string;
}

export interface Action {
  id: string;
  title: string;
  date: Date;
  createdAt: Date;
  description?: string | null;
  location?: string | null;
  imageUrl?: string | null;
}

export interface CreateActionInput {
  title: string;
  date: Date;
  description?: string;
  location?: string;
  imageUrl?: string;
}

export interface ProblemReport {
  id: string;
  name: string;
  address: string;
  description: string;
  imageUrl?: string | null;
  status?: string | null;
  createdAt: Date;
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
