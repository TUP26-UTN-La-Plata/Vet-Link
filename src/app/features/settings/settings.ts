import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ConfirmModal } from '@shared/components/confirm-modal/confirm-modal';
import { UserAgentCard } from './user-agent-card/user-agent-card';
import { ProfileCard } from './profile-card/profile-card';
import { SettingsCard } from './settings-card/settings-card';
import { provideTranslocoScope, TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-settings',
  imports: [UserAgentCard, ProfileCard, SettingsCard, ConfirmModal, TranslocoModule],
  providers: [provideTranslocoScope('settings')],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected logoutModalOpen = false;

  protected onLogoutRequested(): void {
    this.logoutModalOpen = true;
  }

  protected onLogoutCancel(): void {
    this.logoutModalOpen = false;
  }

  protected onLogoutConfirm(): void {
    this.logoutModalOpen = false;
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
