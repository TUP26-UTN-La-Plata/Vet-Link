import { Component, output } from '@angular/core';
import { ActionButton } from '@shared/ui/action-button/action-button';

@Component({
  selector: 'app-settings-card',
  imports: [ActionButton],
  templateUrl: './settings-card.html',
  styleUrl: './settings-card.css',
})
export class SettingsCard {
  readonly logoutRequested = output<void>();

  protected onSignOutClick(): void {
    this.logoutRequested.emit();
  }
}
