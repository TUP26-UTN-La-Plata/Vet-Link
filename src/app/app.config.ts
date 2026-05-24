import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { AppTitleStrategy } from './core/strategies/app-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura, // O prueba Lara, Nora, etc.
        preset: Aura, // O prueba Lara, Nora, etc.
        options: {
          prefix: 'p', // Prefijo por defecto
          darkModeSelector: '.dark', // Soporte dark mode
        },
      },
    }),
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ['es'],
        defaultLang: 'es',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    { provide: TitleStrategy, useClass: AppTitleStrategy }
  ],
};
