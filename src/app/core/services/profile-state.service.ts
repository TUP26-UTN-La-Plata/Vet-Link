import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { EMPTY_USER_PROFILE, UserProfile } from '../../features/settings/account/account.interface';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileStateService {
  readonly #http = inject(HttpClient);
  readonly #apiUrl = `${environment.apiUrl}/me/profile`;

  readonly #profileSubject = new BehaviorSubject<UserProfile>(EMPTY_USER_PROFILE);
  readonly profile$ = this.#profileSubject.asObservable();

  loadProfile(): void {
    this.getProfileFromApi().subscribe();
  }

  getProfileFromApi(): Observable<UserProfile> {
    return this.#http.get<UserProfile>(this.#apiUrl).pipe(
      tap((profile) => {
        this.#profileSubject.next(profile ?? EMPTY_USER_PROFILE);
      })
    );
  }

  getCurrentProfile(): UserProfile {
    return this.#profileSubject.value;
  }

  updateProfile(profile: UserProfile): Observable<UserProfile> {
    const normalizedProfile: UserProfile = {
      phones: profile.phones.filter((phone) => phone.trim().length > 0),
      address: profile.address.trim(),
      birthDate: profile.birthDate,
    };

    return this.#http.put<UserProfile>(this.#apiUrl, normalizedProfile).pipe(
      tap((updated) => {
        this.#profileSubject.next(updated);
      })
    );
  }

  clearCache(): void {
    this.#profileSubject.next(EMPTY_USER_PROFILE);
  }
}
