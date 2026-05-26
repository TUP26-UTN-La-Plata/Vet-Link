import { Injectable, signal } from '@angular/core';
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
  readonly authState = this.#firebaseUser.asReadonly();

  constructor() {
    this.#initializeFirebase();
  }

  #initializeFirebase(): void {
    onAuthStateChanged(this.#auth, (firebaseUser) => {
      this.#firebaseUser.set(firebaseUser);
    });
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.#auth, provider);
    } catch (error) {
      console.error('Error durante el login con Google:', error);
      throw error;
    }
  }

  logout(): void {
    signOut(this.#auth).catch((error) => {
      console.error('Error durante el logout:', error);
    });
  }

  isLoggedIn(): boolean {
    return this.#firebaseUser() !== null;
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
      photoURL: user.photoURL ?? '',
    };
  }
}
