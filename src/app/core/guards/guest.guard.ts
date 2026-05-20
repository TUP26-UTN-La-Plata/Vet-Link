import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  canActivate(): boolean {
    if (this.#authService.isLoggedIn()) {
      this.#router.navigate(['/patients']);
      return false;
    }

    return true;
  }
}
