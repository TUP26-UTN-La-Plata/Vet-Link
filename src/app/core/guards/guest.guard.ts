import { inject, Injector } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const injector = inject(Injector);

  return toObservable(authService.isLoaded, { injector }).pipe(
    filter((loaded): loaded is true => loaded === true),
    take(1),
    map(() => {
      if (authService.isLoggedIn()) {
        router.navigate(['/patients']);
        return false;
      }

      return true;
    })
  );
};
