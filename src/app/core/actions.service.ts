import { Injectable, inject, signal } from '@angular/core';
import { executeQuery, executeMutation, queryRef, mutationRef } from 'firebase/data-connect';
import { FIREBASE_DATA_CONNECT } from '../firebase';
import { Action, CreateActionInput } from '../models';

interface ListActionsData { actions: Action[] }
interface GetActionData { action: Action | null }
interface CreateActionData { action_insert: { id: string } }
interface UpdateActionVars extends CreateActionInput { id: string }

@Injectable({ providedIn: 'root' })
export class ActionsService {
  private readonly dc = inject(FIREBASE_DATA_CONNECT);

  private readonly _actions = signal<Action[]>([]);
  private _loaded = false;

  /** Reactive list — always up-to-date after any mutation. */
  readonly actions = this._actions.asReadonly();

  async listActions(): Promise<void> {
    if (this._loaded) return;
    const ref = queryRef<ListActionsData>(this.dc, 'ListActions');
    const { data } = await executeQuery(ref);
    this._actions.set(data.actions ?? []);
    this._loaded = true;
  }

  async getAction(id: string): Promise<Action | null> {
    const cached = this._actions().find(a => a.id === id);
    if (cached) return cached;
    const ref = queryRef<GetActionData, { id: string }>(this.dc, 'GetAction', { id });
    const { data } = await executeQuery(ref);
    return data.action;
  }

  async createAction(input: CreateActionInput): Promise<string> {
    const ref = mutationRef<CreateActionData, CreateActionInput>(this.dc, 'CreateAction', input);
    const { data } = await executeMutation(ref);
    const id = data.action_insert.id;
    const newAction: Action = {
      id,
      title: input.title,
      date: input.date,
      createdAt: new Date(),
      description: input.description ?? null,
      location: input.location ?? null,
      imageUrl: input.imageUrl ?? null,
    };
    this._actions.update(list => [newAction, ...list]);
    this._loaded = true;
    return id;
  }

  async updateAction(id: string, input: CreateActionInput): Promise<void> {
    const ref = mutationRef<void, UpdateActionVars>(this.dc, 'UpdateAction', { id, ...input });
    await executeMutation(ref);
    this._actions.update(list => list.map(a => (a.id === id ? { ...a, ...input } : a)));
  }

  async deleteAction(id: string): Promise<void> {
    const ref = mutationRef<void, { id: string }>(this.dc, 'DeleteAction', { id });
    await executeMutation(ref);
    this._actions.update(list => list.filter(a => a.id !== id));
  }
}
