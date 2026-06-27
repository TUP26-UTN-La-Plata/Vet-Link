import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { AnalyticsService } from '@core/services/analytics.service';
import { ConfirmModal } from '@shared/components/confirm-modal/confirm-modal';
import { UserAgentCard } from './user-agent-card/user-agent-card';
import { ProfileCard } from './profile-card/profile-card';
import { SettingsCard } from './settings-card/settings-card';
import { provideTranslocoScope, TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-settings',
  imports: [UserAgentCard, ProfileCard, SettingsCard, ConfirmModal, TranslocoModule],
  providers: [provideTranslocoScope('settings')],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  #authService = inject(AuthService);
  #analyticsService = inject(AnalyticsService);
  #translocoService = inject(TranslocoService);

  protected logoutModalOpen = false;

  protected onLogoutRequested(): void {
    this.logoutModalOpen = true;
  }

  protected onLogoutCancel(): void {
    this.logoutModalOpen = false;
  }

  protected async onLogoutConfirm(): Promise<void> {
    this.logoutModalOpen = false;

    const user = this.#authService.getUserData();
    const userEmail = user?.email || 'google_user_without_email';

    try {
      this.#analyticsService.trackEvent('logout_user', {
        user_email: userEmail,
      });

      await this.#authService.logout();
    } catch (error) {
      console.error(this.#translocoService.translate('settings.logout.error'), error);
    }
  }
}
