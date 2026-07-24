import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { ProfileStateService } from '@core/services/profile-state.service';
import { ActionButton } from '@shared/ui/action-button/action-button';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-profile-card',
  imports: [TranslocoModule, ActionButton, AsyncPipe],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.css',
})
export class ProfileCard implements OnInit {
  readonly #router = inject(Router);
  readonly #profileStateService = inject(ProfileStateService);

  protected readonly authService = inject(AuthService);
  protected readonly profile$ = this.#profileStateService.profile$;

  ngOnInit(): void {
    this.#profileStateService.loadProfile();
  }

  onEditProfile(): void {
    this.#router.navigate(['/settings/account']);
  }
}
