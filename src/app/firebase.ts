import { InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Analytics, getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyD2I3_owIMf2b2WLmyBTbJxZcU4aL0i3i0',
  authDomain: 'zbor-kg.firebaseapp.com',
  projectId: 'zbor-kg',
  storageBucket: 'zbor-kg.firebasestorage.app',
  messagingSenderId: '845434694723',
  appId: '1:845434694723:web:177ae7c9179d14292038f6',
  measurementId: 'G-Q9JYTQY063',
};

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('firebase-app', {
  providedIn: 'root',
  factory: () => initializeApp(firebaseConfig),
});

export const FIREBASE_ANALYTICS = new InjectionToken<Analytics | null>('firebase-analytics', {
  providedIn: 'root',
  factory: () => {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return null;
    return getAnalytics(inject(FIREBASE_APP));
  },
});
