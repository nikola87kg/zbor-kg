import { Injectable, inject } from '@angular/core';
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

  async listAffairs(): Promise<Affair[]> {
    const ref = queryRef<ListAffairsData>(this.dc, 'ListAffairs');
    const { data } = await executeQuery(ref);
    return data.affairs;
  }

  async getAffair(id: string): Promise<Affair | null> {
    const ref = queryRef<GetAffairData, { id: string }>(this.dc, 'GetAffair', { id });
    const { data } = await executeQuery(ref);
    return data.affair;
  }

  async createAffair(input: CreateAffairInput): Promise<string> {
    const ref = mutationRef<CreateAffairData, CreateAffairInput>(
      this.dc, 'CreateAffair', input,
    );
    const { data } = await executeMutation(ref);
    return data.affair_insert.id;
  }

  async updateAffair(id: string, input: CreateAffairInput): Promise<void> {
    const ref = mutationRef<void, UpdateAffairVars>(
      this.dc, 'UpdateAffair', { id, ...input },
    );
    await executeMutation(ref);
  }

  async deleteAffair(id: string): Promise<void> {
    const ref = mutationRef<void, { id: string }>(this.dc, 'DeleteAffair', { id });
    await executeMutation(ref);
  }
}
