import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ConfirmModal } from '@shared/components/confirm-modal/confirm-modal';
import { UserAgentCard } from './user-agent-card/user-agent-card';
import { ProfileCard } from './profile-card/profile-card';
import { SettingsCard } from './settings-card/settings-card';

@Component({
  selector: 'app-settings',
  imports: [UserAgentCard, ProfileCard, SettingsCard, ConfirmModal],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private readonly authService = inject(AuthService);

  protected logoutModalOpen = false;

  protected onLogoutRequested(): void {
    this.logoutModalOpen = true;
  }

  protected onLogoutCancel(): void {
    this.logoutModalOpen = false;
  }

  protected async onLogoutConfirm(): Promise<void> {
    this.logoutModalOpen = false;
    await this.authService.logout();
  }
}
