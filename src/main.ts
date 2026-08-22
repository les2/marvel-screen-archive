import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter,withInMemoryScrolling } from '@angular/router';
import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';
import { startPwaUpdateChecks } from './app/pwa-update';

enableProdMode();
startPwaUpdateChecks();

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(),provideRouter(APP_ROUTES,withInMemoryScrolling({anchorScrolling:'enabled',scrollPositionRestoration:'enabled'}))]
}).catch((error) => console.error(error));
