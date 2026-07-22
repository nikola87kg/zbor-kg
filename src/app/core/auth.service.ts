import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { executeQuery, queryRef } from 'firebase/data-connect';
import { FIREBASE_AUTH, FIREBASE_DATA_CONNECT } from '../firebase';

interface GetMyRoleData { userRole: { role: string } | null }

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly dc = inject(FIREBASE_DATA_CONNECT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _user = signal<User | null>(null);
  private readonly _role = signal<string | null>(null);

  private _authReadyResolve!: () => void;
  /** Resolves after the first Firebase auth state check (including role load). */
  readonly authReady: Promise<void> = new Promise(res => { this._authReadyResolve = res; });

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null && !this._user()!.isAnonymous);
  readonly isAdmin = computed(() => this._role() === 'Admin');
  readonly initials = computed(() => {
    const u = this._user();
    if (!u) return '';
    const name = u.displayName ?? u.email ?? '';
    return name.slice(0, 2).toUpperCase();
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {
        if (!firebaseUser) {
          this._user.set(null);
          this._role.set(null);
        } else if (firebaseUser.isAnonymous) {
          this._user.set(this.toUser(firebaseUser));
          this._role.set(null);
        } else {
          this._user.set(this.toUser(firebaseUser));
          await this.loadRole(firebaseUser.uid);
        }
        this._authReadyResolve();
      });
    } else {
      this._authReadyResolve();
    }
  }

  private async loadRole(uid: string): Promise<void> {
    try {
      const ref = queryRef<GetMyRoleData, { uid: string }>(this.dc, 'GetMyRole', { uid });
      const { data } = await executeQuery(ref);
      this._role.set(data.userRole?.role ?? null);
    } catch {
      this._role.set(null);
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

  /** Ensures a Firebase auth token exists. Signs in anonymously if no user is logged in.
   *  Needed for public Firebase operations (Storage uploads, public Data Connect mutations)
   *  that still require the SDK to have an auth context. */
  async ensureAuth(): Promise<void> {
    if (!this.auth.currentUser) {
      await signInAnonymously(this.auth);
    }
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async updateUserProfile(data: { displayName?: string; photoURL?: string | null }): Promise<void> {
    const firebaseUser = this.auth.currentUser;
    if (!firebaseUser) throw new Error('Nije prijavljen korisnik.');
    await updateProfile(firebaseUser, data);
    // Re-read after update — Firebase mutates the object in-place but currentUser is fresh
    const updated = this.auth.currentUser;
    if (updated) this._user.set(this.toUser(updated));
  }

  private toUser(u: FirebaseUser): User {
    return { uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL, isAnonymous: u.isAnonymous };
  }
}
