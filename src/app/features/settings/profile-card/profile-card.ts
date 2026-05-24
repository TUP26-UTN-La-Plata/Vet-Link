import { Component } from '@angular/core';
import { ActionButton } from '../../../shared/ui/action-button/action-button';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-profile-card',
  imports: [ActionButton, TranslocoModule],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.css',
})
export class ProfileCard {
  //TODO: Edit profile functionality.
  onEditProfile(): void {
    console.log('Editing profile');
  }
}
