import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { firebaseConfig } from '../config/firebase.config';

export interface UserData {
  name: string;
  email: string;
  photoURL: string;
}

interface AppUser {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  uid?: string | null;
}

interface NativeFirebaseUser extends AppUser {
  photoUrl?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #auth = initializeAuth(initializeApp(firebaseConfig), {
    persistence: browserLocalPersistence,
  });

  #router = inject(Router);
  #firebaseUser = signal<AppUser | null | undefined>(undefined);
  #isSigningOut = false;

  #isCapacitor(): boolean {
    try {
      return Capacitor.getPlatform && Capacitor.getPlatform() !== 'web';
    } catch {
      return false;
    }
  }

  // Método auxiliar para detectar si estamos en el entorno de escritorio de Tauri
  #isTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

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
    if (this.#isCapacitor()) {
      // On native (Capacitor) try to get the current native user from the plugin
      FirebaseAuthentication.getCurrentUser()
        .then((nativeUser) => {
          const n = nativeUser as NativeFirebaseUser | null | undefined;
          if (n && n.uid) {
            this.#firebaseUser.set({
              displayName: n.displayName ?? '',
              email: n.email ?? '',
              photoURL: n.photoUrl ?? n.photoURL ?? '/avatar.webp',
              uid: n.uid ?? null,
            });
          } else {
            this.#firebaseUser.set(null);
          }
        })
        .catch(() => {
          this.#firebaseUser.set(null);
        });

      try {
        FirebaseAuthentication.addListener?.(
          'authStateChange',
          (data?: { user?: NativeFirebaseUser | null }) => {
            const u = data?.user as NativeFirebaseUser | null | undefined;
            if (u) {
              this.#firebaseUser.set({
                displayName: u.displayName ?? '',
                email: u.email ?? '',
                photoURL: u.photoUrl ?? u.photoURL ?? '/avatar.webp',
                uid: u.uid ?? null,
              });
            } else {
              this.#firebaseUser.set(null);
            }
          }
        );
      } catch {
        // ignore if plugin doesn't support this listener shape
      }
    } else {
      // Si estamos en Tauri, capturamos el resultado de la redirección al arrancar la app
      if (this.#isTauri()) {
        getRedirectResult(this.#auth).catch((error) => {
          console.error('Error al procesar redirección en Tauri:', error);
        });
      }

      onAuthStateChanged(this.#auth, async (firebaseUser) => {
        if (firebaseUser) {
          this.#firebaseUser.set({
            displayName: firebaseUser.displayName ?? '',
            email: firebaseUser.email ?? '',
            photoURL: firebaseUser.photoURL ?? '/avatar.webp',
            uid: firebaseUser.uid ?? null,
          });
        } else {
          this.#firebaseUser.set(null);
        }

        if (firebaseUser === null && this.#isSigningOut) {
          await this.#clearBrowserState();
          this.#isSigningOut = false;
          await this.#router.navigate(['/login']);
        }
      });
    }
  }

  async loginWithGoogle(): Promise<void> {
    if (this.#isCapacitor()) {
      // Use native plugin on Capacitor platforms
      await FirebaseAuthentication.signInWithGoogle();
      // refresh native user
      try {
        const nativeUser = await FirebaseAuthentication.getCurrentUser();
        const n = nativeUser as NativeFirebaseUser | null | undefined;
        if (n && n.uid) {
          this.#firebaseUser.set({
            displayName: n.displayName ?? '',
            email: n.email ?? '',
            photoURL: n.photoUrl ?? n.photoURL ?? '/avatar.webp',
            uid: n.uid ?? null,
          });
        }
      } catch {
        // ignore
      }
    } else {
      const provider = new GoogleAuthProvider();

      if (this.#isTauri()) {
        // Usar redirección en entornos nativos de escritorio para evitar bloqueo de popups
        await signInWithRedirect(this.#auth, provider);
      } else {
        // Mantener comportamiento estándar en la versión Web tradicional
        await signInWithPopup(this.#auth, provider);
      }
    }
  }

  async logout(): Promise<void> {
    this.#isSigningOut = true;

    try {
      if (this.#isCapacitor()) {
        await FirebaseAuthentication.signOut();
        this.#firebaseUser.set(null);
        await this.#clearBrowserState();
        this.#isSigningOut = false;
        await this.#router.navigate(['/login']);
      } else {
        await signOut(this.#auth);
      }
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

  getUserId(): string | null {
    return this.#firebaseUser()?.uid ?? null;
  }

  getUserEmail(): string | null {
    return this.#firebaseUser()?.email ?? null;
  }

  getUserPhoto(): string | null {
    return this.#firebaseUser()?.photoURL ?? null;
  }
}
