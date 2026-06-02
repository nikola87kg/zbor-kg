import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebase';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly initials = computed(() => {
    const u = this._user();
    if (!u) return '';
    const name = u.displayName ?? u.email ?? '';
    return name.slice(0, 2).toUpperCase();
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      onAuthStateChanged(this.auth, (firebaseUser: FirebaseUser | null) => {
        this._user.set(firebaseUser ? this.toUser(firebaseUser) : null);
      });
    }
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(displayName: string, email: string, password: string): Promise<void> {
    const { user } = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(user, { displayName });
    this._user.set(this.toUser(user));
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  private toUser(u: FirebaseUser): User {
    return { uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL };
  }
}
