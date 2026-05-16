import { Component, inject } from '@angular/core';
import { ActionButton } from '@shared/ui/action-button/action-button';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-profile-card',
  imports: [ActionButton],
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
