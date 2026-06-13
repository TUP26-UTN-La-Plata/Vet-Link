import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  #router = inject(Router);
  #firebaseUser = signal<User | null | undefined>(undefined);
  #isSigningOut = false;

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
    onAuthStateChanged(this.#auth, async (firebaseUser) => {
      this.#firebaseUser.set(firebaseUser);
      
      if (firebaseUser === null && this.#isSigningOut) {
        await this.#clearBrowserState();
        this.#isSigningOut = false;
        await this.#router.navigate(['/login']);
      }
    });
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.#auth, provider);
  }

  async logout(): Promise<void> {
    this.#isSigningOut = true;

    try {
      await signOut(this.#auth);
    } catch (error) {
      this.#isSigningOut = false;
      throw error;
    }
  }

  async #clearBrowserState(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
        } catch (error) {
          console.warn('Could not clear localStorage on logout', error);
        }

        try {
          sessionStorage.clear();
        } catch (error) {
          console.warn('Could not clear sessionStorage on logout', error);
        }

        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
          } catch (error) {
            console.warn('Could not clear Cache Storage on logout', error);
          }
        }
      }
    } catch (error) {
      console.error('Error during logout cleanup', error);
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
