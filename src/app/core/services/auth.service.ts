import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  browserPopupRedirectResolver,
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
        // ignore
      }
    } else {
      if (this.#isTauri()) {
        this.#setupTauriDeepLinkListener();
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

  async #setupTauriDeepLinkListener(): Promise<void> {
    if (!this.#isTauri()) return;

    try {
      const { listen } = await import('@tauri-apps/api/event');

      // 1. ESCUCHAR LA INTERCEPCIÓN DE INSTANCIA ÚNICA (Crucial para Windows)
      await listen<{ args: string[]; cwd: string }>('single-instance', (event) => {
        console.log('Argumentos de instancia única recibidos en Tauri:', event.payload.args);

        // Buscamos dentro de la lista de argumentos de Windows cuál contiene nuestro esquema
        const urlString = event.payload.args.find((arg) => arg.startsWith('vetlink-app://'));

        if (urlString) {
          console.log('URL de Deep Link detectada:', urlString);
          this.#procesarTokenDeRetorno(urlString);
        }
      });

      // 2. Escuchar enlaces en caliente por canal estándar (Útil para depuración o macOS)
      await listen<{ urls: string[] }>('tauri://deep-link', (event) => {
        const urlString = event.payload.urls.at(0);
        if (urlString && urlString.startsWith('vetlink-app://')) {
          this.#procesarTokenDeRetorno(urlString);
        }
      });
    } catch (error) {
      console.error('Error configurando los listeners de Deep Link en Tauri:', error);
    }
  }

  async #procesarTokenDeRetorno(urlString: string): Promise<void> {
    try {
      const urlObj = new URL(urlString);
      const token = urlObj.searchParams.get('token');

      if (token) {
        console.log('Procesando Access Token oficial de Google en Tauri...');

        const credential = GoogleAuthProvider.credential(null, token);

        await signInWithCredential(this.#auth, credential);

        console.log('¡Sesión autorizada exitosamente en el núcleo de Tauri!');
      }
    } catch (error) {
      console.error('Error al procesar el inicio de sesión desde Tauri:', error);
    }
  }

  async loginWithGoogle(): Promise<void> {
    if (this.#isCapacitor()) {
      // Flujo nativo inalterado para Android/iOS con Capacitor
      await FirebaseAuthentication.signInWithGoogle();
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
    } else if (this.#isTauri()) {
      // Flujo nativo inalterado para lanzar el Chrome externo desde Tauri
      try {
        const { openUrl } = await import('@tauri-apps/plugin-opener');
        const urlLoginWeb = 'http://localhost:4200/login-tauri';
        await openUrl(urlLoginWeb);
      } catch (error) {
        console.error('Error abriendo el navegador externo:', error);
      }
    } else {
      //  Si se llama desde la web suelta pero proviniendo de la ruta de tauri, no hacer nada
      if (typeof window !== 'undefined' && window.location.pathname.includes('login-tauri')) {
        return;
      }

      // Pasamos browserPopupRedirectResolver como tercer argumento para forzar la activación del gestor de popups de Chrome
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.#auth, provider, browserPopupRedirectResolver);
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
