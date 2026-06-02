import { Injectable, inject } from '@angular/core';
import { executeQuery, executeMutation, queryRef, mutationRef } from 'firebase/data-connect';
import { FIREBASE_DATA_CONNECT } from '../firebase';
import { CalendarEntry, CalendarEntryType, CreateCalendarEntryInput } from '../models';

interface ListEntriesData { calendarEntries: CalendarEntry[] }
interface ListTypesData { calendarEntryTypes: CalendarEntryType[] }
interface CreateEntryData { calendarEntry_insert: { id: string } }
interface DeleteEntryVars { id: string }

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly dc = inject(FIREBASE_DATA_CONNECT);

  async listEntries(): Promise<CalendarEntry[]> {
    const ref = queryRef<ListEntriesData>(this.dc, 'ListCalendarEntries');
    const { data } = await executeQuery(ref);
    return data.calendarEntries;
  }

  async listEntryTypes(): Promise<CalendarEntryType[]> {
    const ref = queryRef<ListTypesData>(this.dc, 'ListCalendarEntryTypes');
    const { data } = await executeQuery(ref);
    return data.calendarEntryTypes;
  }

  async createEntry(input: CreateCalendarEntryInput): Promise<string> {
    const ref = mutationRef<CreateEntryData, CreateCalendarEntryInput>(
      this.dc,
      'CreateCalendarEntry',
      input,
    );
    const { data } = await executeMutation(ref);
    return data.calendarEntry_insert.id;
  }

  async deleteEntry(id: string): Promise<void> {
    const ref = mutationRef<void, DeleteEntryVars>(this.dc, 'DeleteCalendarEntry', { id });
    await executeMutation(ref);
  }
}
