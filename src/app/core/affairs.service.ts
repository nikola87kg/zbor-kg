import { Injectable, inject, signal } from '@angular/core';
import { executeQuery, executeMutation, queryRef, mutationRef } from 'firebase/data-connect';
import { FIREBASE_DATA_CONNECT } from '../firebase';
import { Affair, CreateAffairInput } from '../models';

interface ListAffairsData { affairs: Affair[] }
interface GetAffairData { affair: Affair | null }
interface CreateAffairData { affair_insert: { id: string } }
interface UpdateAffairVars extends CreateAffairInput { id: string }

@Injectable({ providedIn: 'root' })
export class AffairsService {
  private readonly dc = inject(FIREBASE_DATA_CONNECT);

  private readonly _affairs = signal<Affair[]>([]);
  private _loaded = false;

  /** Reactive list — always up-to-date after any mutation. */
  readonly affairs = this._affairs.asReadonly();

  async listAffairs(): Promise<void> {
    if (this._loaded) return;
    const ref = queryRef<ListAffairsData>(this.dc, 'ListAffairs');
    const { data } = await executeQuery(ref);
    this._affairs.set(data.affairs ?? []);
    this._loaded = true;
  }

  async getAffair(id: string): Promise<Affair | null> {
    const cached = this._affairs().find(a => a.id === id);
    if (cached) return cached;
    const ref = queryRef<GetAffairData, { id: string }>(this.dc, 'GetAffair', { id });
    const { data } = await executeQuery(ref);
    return data.affair;
  }

  async createAffair(input: CreateAffairInput): Promise<string> {
    const ref = mutationRef<CreateAffairData, CreateAffairInput>(this.dc, 'CreateAffair', input);
    const { data } = await executeMutation(ref);
    const id = data.affair_insert.id;
    const newAffair: Affair = {
      id,
      title: input.title,
      publishedAt: input.publishedAt,
      createdAt: new Date(),
      content: input.content ?? null,
      imageUrl: input.imageUrl ?? null,
    };
    this._affairs.update(list => [newAffair, ...list]);
    this._loaded = true;
    return id;
  }

  async updateAffair(id: string, input: CreateAffairInput): Promise<void> {
    const ref = mutationRef<void, UpdateAffairVars>(this.dc, 'UpdateAffair', { id, ...input });
    await executeMutation(ref);
    this._affairs.update(list => list.map(a => (a.id === id ? { ...a, ...input } : a)));
  }

  async deleteAffair(id: string): Promise<void> {
    const ref = mutationRef<void, { id: string }>(this.dc, 'DeleteAffair', { id });
    await executeMutation(ref);
    this._affairs.update(list => list.filter(a => a.id !== id));
  }
}
