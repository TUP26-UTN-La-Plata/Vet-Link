import { Component, output } from '@angular/core';
import { ActionButton } from '../../../shared/ui/action-button/action-button';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-settings-card',
  imports: [ActionButton, TranslocoModule],
  templateUrl: './settings-card.html',
  styleUrl: './settings-card.css',
})
export class SettingsCard {
  readonly logoutRequested = output<void>();

  protected onSignOutClick(): void {
    this.logoutRequested.emit();
  }
}
