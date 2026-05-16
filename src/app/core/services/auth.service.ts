import { Injectable, signal, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { firebaseConfig } from '../config/firebase.config';

export interface SessionData {
  userId: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  loginTime: string;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #sessionKey = 'vetlink_session';
  isAuthenticated = signal(false);
  currentUser = signal<SessionData | null>(null);
  #auth = getAuth(initializeApp(firebaseConfig));

  constructor() {
    this.#initializeFirebase();
    this.#checkSession();
  }

  #initializeFirebase(): void {
    onAuthStateChanged(this.#auth, (firebaseUser) => {
      if (firebaseUser) {
        const sessionData: SessionData = {
          userId: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          loginTime: new Date().toISOString(),
          isAuthenticated: true,
        };
        sessionStorage.setItem(this.#sessionKey, JSON.stringify(sessionData));
        this.isAuthenticated.set(true);
        this.currentUser.set(sessionData);
      } else {
        this.clearSession();
      }
    });
  }

  #checkSession(): void {
    const session = sessionStorage.getItem(this.#sessionKey);
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        this.isAuthenticated.set(sessionData.isAuthenticated);
        this.currentUser.set(sessionData);
      } catch (e) {
        this.clearSession();
      }
    }
  }

  // Login con Google usando Firebase
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.#auth, provider);
      const user = result.user;

      const sessionData: SessionData = {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        loginTime: new Date().toISOString(),
        isAuthenticated: true,
      };

      sessionStorage.setItem(this.#sessionKey, JSON.stringify(sessionData));
      this.isAuthenticated.set(true);
      this.currentUser.set(sessionData);
    } catch (error) {
      console.error('Error durante el login con Google:', error);
      throw error;
    }
  }

  getSession(): SessionData | null {
    const session = sessionStorage.getItem(this.#sessionKey);
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Método legacy - mantener para compatibilidad
  login(userId: string = 'user_' + Date.now()): void {
    const sessionData: SessionData = {
      userId,
      loginTime: new Date().toISOString(),
      isAuthenticated: true,
    };

    sessionStorage.setItem(this.#sessionKey, JSON.stringify(sessionData));
    this.isAuthenticated.set(true);
    this.currentUser.set(sessionData);
  }

  logout(): void {
    signOut(this.#auth)
      .then(() => {
        this.clearSession();
      })
      .catch((error) => {
        console.error('Error durante el logout:', error);
      });
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  private clearSession(): void {
    sessionStorage.removeItem(this.#sessionKey);
    this.isAuthenticated.set(false);
  }
}
