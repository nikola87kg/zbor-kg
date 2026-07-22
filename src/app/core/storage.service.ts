import { Injectable, inject } from '@angular/core';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FIREBASE_STORAGE } from '../firebase';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = inject(FIREBASE_STORAGE);

  async uploadImage(file: File, folder: string): Promise<string> {
    const path = `${folder}/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file, { contentType: file.type });
    return getDownloadURL(storageRef);
  }
}
