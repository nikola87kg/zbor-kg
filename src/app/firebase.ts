import { InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { Auth, getAuth } from 'firebase/auth';
import { DataConnect, getDataConnect } from 'firebase/data-connect';

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

export const FIREBASE_AUTH = new InjectionToken<Auth>('firebase-auth', {
  providedIn: 'root',
  factory: () => getAuth(inject(FIREBASE_APP)),
});

export const FIREBASE_DATA_CONNECT = new InjectionToken<DataConnect>('firebase-data-connect', {
  providedIn: 'root',
  // connector, location i service treba da odgovaraju konfiguraciji u Firebase konzoli
  factory: () => getDataConnect(inject(FIREBASE_APP), {
    connector: 'default',
    location: 'europe-west4',
    service: 'zbor-kg-service',
  }),
});

export const FIREBASE_ANALYTICS = new InjectionToken<Analytics | null>('firebase-analytics', {
  providedIn: 'root',
  factory: () => {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return null;
    return getAnalytics(inject(FIREBASE_APP));
  },
});
