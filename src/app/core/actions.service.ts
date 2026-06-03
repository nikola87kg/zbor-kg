import { Injectable, inject } from '@angular/core';
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

  async listActions(): Promise<Action[]> {
    const ref = queryRef<ListActionsData>(this.dc, 'ListActions');
    const { data } = await executeQuery(ref);
    return data.actions;
  }

  async getAction(id: string): Promise<Action | null> {
    const ref = queryRef<GetActionData, { id: string }>(this.dc, 'GetAction', { id });
    const { data } = await executeQuery(ref);
    return data.action;
  }

  async createAction(input: CreateActionInput): Promise<string> {
    const ref = mutationRef<CreateActionData, CreateActionInput>(
      this.dc, 'CreateAction', input,
    );
    const { data } = await executeMutation(ref);
    return data.action_insert.id;
  }

  async updateAction(id: string, input: CreateActionInput): Promise<void> {
    const ref = mutationRef<void, UpdateActionVars>(
      this.dc, 'UpdateAction', { id, ...input },
    );
    await executeMutation(ref);
  }

  async deleteAction(id: string): Promise<void> {
    const ref = mutationRef<void, { id: string }>(this.dc, 'DeleteAction', { id });
    await executeMutation(ref);
  }
}
