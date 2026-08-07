import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UserMe {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: 'VET' | 'RECEPTIONIST';
}

@Injectable({ providedIn: 'root' })
export class UserRoleService {
  #http = inject(HttpClient);

  #userMeSubject$ = new BehaviorSubject<UserMe | null>(null);

  public userMe$: Observable<UserMe | null> = this.#userMeSubject$.asObservable();

  fetchMe(): Observable<UserMe> {
    return this.#http
      .get<UserMe>(`${environment.apiUrl}/me`)
      .pipe(tap((user) => this.#userMeSubject$.next(user)));
  }

  get currentUser(): UserMe | null {
    return this.#userMeSubject$.value;
  }

  get role(): 'VET' | 'RECEPTIONIST' {
    return this.#userMeSubject$.value?.role ?? 'RECEPTIONIST';
  }

  get isVet(): boolean {
    return this.role === 'VET';
  }

  get isReceptionist(): boolean {
    return this.role === 'RECEPTIONIST';
  }
}
