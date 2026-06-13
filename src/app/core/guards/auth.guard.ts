import { Injectable, Injector } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, Observable, take } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private injector: Injector,
    private authService: AuthService
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return toObservable(this.authService.isLoaded, { injector: this.injector }).pipe(
      filter(Boolean),
      take(1),
      map(() =>
        this.authService.isLoggedIn() || this.router.createUrlTree(['/login'])
      )
    );
  }
}
