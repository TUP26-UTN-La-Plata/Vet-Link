import { Component, inject } from '@angular/core';
import { ActionButton } from '@shared/ui/action-button/action-button';
import { AuthService } from '@core/services/auth.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-profile-card',
  imports: [ActionButton, TranslocoModule],
  imports: [ActionButton, TranslocoModule],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.css',
})
export class ProfileCard {
  protected readonly authService = inject(AuthService);

  //TODO: Edit profile functionality.
  onEditProfile(): void {
    console.log('Editing profile');
  }
}
