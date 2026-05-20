import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  readonly #router = inject(Router);
  readonly #authService = inject(AuthService);

  canActivate(): boolean {
    if (this.#authService.isLoggedIn()) {
      return true;
    }

    this.#router.navigate(['/login']);
    return false;
  }
}
