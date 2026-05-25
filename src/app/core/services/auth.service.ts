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
  #firebaseUser = signal<User | null>(null);
  #isAuthInitialized = signal(false);

  readonly authState = this.#firebaseUser.asReadonly();
  readonly isAuthInitialized = this.#isAuthInitialized.asReadonly();
  readonly isLoggedIn = computed(() => this.#firebaseUser() !== null);
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
      this.#isAuthInitialized.set(true);
    });
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.#auth, provider);
  }

  logout = (): Promise<void> => signOut(this.#auth);

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
