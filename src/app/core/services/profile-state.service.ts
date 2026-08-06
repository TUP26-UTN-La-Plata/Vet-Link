import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { EMPTY_USER_PROFILE, UserProfile } from '../../features/settings/account/account.interface';
import { AuthService } from './auth.service';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileStateService {
  readonly #FALLBACK_CACHE_KEY = 'user_profile_cache';
  readonly #localStorageService = inject(LocalStorageService);
  readonly #authService = inject(AuthService);
  readonly #http = inject(HttpClient);
  readonly #apiUrl = `${environment.apiUrl}/me/profile`;

  readonly #profileSubject = new BehaviorSubject<UserProfile>(EMPTY_USER_PROFILE);
  readonly profile$ = this.#profileSubject.asObservable();

  constructor() {
    this.initializeState();
  }

  getProfile(): Observable<UserProfile> {
    this.#syncFromStorage();
    return of(this.#profileSubject.value);
  }

  getCurrentProfile(): UserProfile {
    this.#syncFromStorage();
    return this.#profileSubject.value;
  }

  loadProfile(): void {
    this.#syncFromStorage();
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
        this.#localStorageService.save(this.#getStorageKey(), updated);
      })
    );
  }

  clearCache(): void {
    this.#localStorageService.remove(this.#getStorageKey());
    this.#profileSubject.next(EMPTY_USER_PROFILE);
  }

  private initializeState(): void {
    this.#syncFromStorage();
  }

  #syncFromStorage(): void {
    const storedProfile = this.#localStorageService.get<UserProfile>(this.#getStorageKey());
    this.#profileSubject.next(storedProfile ?? EMPTY_USER_PROFILE);
  }

  #getStorageKey(): string {
    const email = this.#authService.getUserData()?.email;

    if (!email) {
      return this.#FALLBACK_CACHE_KEY;
    }

    return `user_profile_${email}`;
  }
}
