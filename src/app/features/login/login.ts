import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { AnalyticsService } from '@core/services/analytics.service';
import { provideTranslocoScope, TranslocoModule, TranslocoService } from '@jsverse/transloco';
import * as Sentry from '@sentry/angular';

@Component({
  selector: 'app-login',
  imports: [CommonModule, TranslocoModule],
  providers: [provideTranslocoScope('login')],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  isLoading = signal(false);
  loginError = signal<string | null>(null);

  #router = inject(Router);
  #authService = inject(AuthService);
  #analyticsService = inject(AnalyticsService);
  #translocoService = inject(TranslocoService);

  constructor() {
    effect(() => {
      if (this.#authService.isLoggedIn()) {
        this.#router.navigate(['/patients']);
      }
    });
  }

  async loginWithGoogle(): Promise<void> {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.loginError.set(null);

    try {
      await this.#authService.loginWithGoogle();

      const user = this.#authService.getUserData();
      const userEmail = user?.email || 'google_user_without_email';

      Sentry.setUser({
        email: userEmail,
      });

      this.#analyticsService.trackEvent('login_success', {
        userEmail: userEmail,
      });
    } catch (error: unknown) {
      this.loginError.set(
        error instanceof Error ? error.message : this.#translocoService.translate('login.errorText')
      );
      console.error(this.#translocoService.translate('login.errorText'), error);
    } finally {
      this.isLoading.set(false);
    }

    throw new Error(this.#translocoService.translate('login.forcedErrorText'));
  }
}
