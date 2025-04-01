import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideGraphQLClient } from './graphql/apollo.config';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HttpLink } from 'apollo-angular/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideGraphQLClient(),
    provideRouter(appRoutes),
    provideNativeDateAdapter(),
    HttpLink,
    provideAnimations(),
  ],
};
