import { Injectable, computed, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { firebaseConfig } from '../config/firebase.config';

export interface UserData {
  name: string;
  email: string;
  photoURL: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #auth = getAuth(initializeApp(firebaseConfig));
  #firebaseUser = signal<User | null | undefined>(undefined);

  readonly authState = this.#firebaseUser.asReadonly();
  readonly isLoaded = computed(() => this.#firebaseUser() !== undefined);
  readonly isLoggedIn = computed(() => this.#firebaseUser() != null);
  readonly userData = computed<UserData | null>(() => {
    const user = this.#firebaseUser();
    if (!user) {
      return null;
    }

    return {
      name: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL || '/avatar.webp',
    };
  });

  constructor() {
    this.#initializeFirebase();
  }

  #initializeFirebase(): void {
    onAuthStateChanged(this.#auth, (firebaseUser) => {
      this.#firebaseUser.set(firebaseUser);
    });
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.#auth, provider);
  }

  async logout(): Promise<void> {
    await signOut(this.#auth);

    try {
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
        } catch (e) {
          console.warn('Could not clear localStorage on logout', e);
        }

        try {
          sessionStorage.clear();
        } catch (e) {
          console.warn('Could not clear sessionStorage on logout', e);
        }

        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
          } catch (e) {
            console.warn('Could not clear Cache Storage on logout', e);
          }
        }
      }
    } catch (e) {
      console.error('Error during logout cleanup', e);
    }
  }

  isLoggedInSnapshot(): boolean {
    return this.isLoggedIn();
  }

  getUserName(): string | null {
    return this.#firebaseUser()?.displayName ?? null;
  }

  getUserData(): UserData | null {
    const user = this.#firebaseUser();
    if (!user) {
      return null;
    }

    return {
      name: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL || '/avatar.webp',
    };
  }

}
