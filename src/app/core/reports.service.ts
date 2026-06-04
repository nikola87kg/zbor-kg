import { Injectable, inject } from '@angular/core';
import { executeMutation, mutationRef } from 'firebase/data-connect';
import { FIREBASE_DATA_CONNECT } from '../firebase';

export interface SubmitReportInput {
  name: string;
  address: string;
  description: string;
  imageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly dc = inject(FIREBASE_DATA_CONNECT);

  async submitReport(input: SubmitReportInput): Promise<void> {
    const ref = mutationRef<void, SubmitReportInput>(this.dc, 'SubmitReport', input);
    await executeMutation(ref);
  }
}
