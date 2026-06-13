import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-profile-card',
  imports: [TranslocoModule],
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
