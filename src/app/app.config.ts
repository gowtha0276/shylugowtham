import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAnalytics, getAnalytics, ScreenTrackingService } from '@angular/fire/analytics';

import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyDhGjUBN5XlmkaiTmigD7HclMYbzQVtH70",
  authDomain: "shyluwedsgowtham.firebaseapp.com",
  projectId: "shyluwedsgowtham",
  storageBucket: "shyluwedsgowtham.firebasestorage.app",
  messagingSenderId: "210798746875",
  appId: "1:210798746875:web:d23e5c54383e85c086a45e",
  measurementId: "G-L33RHWBJTZ"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService
  ]
};
