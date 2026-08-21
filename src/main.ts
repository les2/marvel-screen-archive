import '@angular/compiler';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';

enableProdMode();

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()]
}).then(() => {
  if ('serviceWorker' in navigator && location.hostname !== '127.0.0.1') void navigator.serviceWorker.register('/sw.js');
}).catch((error) => console.error(error));
