import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
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
  private readonly router = inject(Router);

  protected logoutModalOpen = false;

  protected onLogoutRequested(): void {
    this.logoutModalOpen = true;
  }

  protected onLogoutCancel(): void {
    this.logoutModalOpen = false;
  }

  protected onLogoutConfirm(): void {
    this.logoutModalOpen = false;
    sessionStorage.removeItem('vetlink_session');
    void this.router.navigate(['/login']);
  }
}
