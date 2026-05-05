import { Component } from '@angular/core';
import { ActionButton } from '../../../shared/ui/action-button/action-button';

@Component({
  selector: 'app-profile-card',
  imports: [ActionButton],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.css',
})
export class ProfileCard {
  //TODO: Edit profile functionality.
  onEditProfile(): void {
    console.log('Editing profile');
  }
}
