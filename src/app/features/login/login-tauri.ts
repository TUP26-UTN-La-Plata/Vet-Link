import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { provideTranslocoScope, TranslocoModule } from '@jsverse/transloco';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { firebaseConfig } from '@core/config/firebase.config';

@Component({
  selector: 'app-login-tauri',
  imports: [CommonModule, TranslocoModule],
  providers: [provideTranslocoScope('login')],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginTauriComponent {
  isLoading = signal(false);
  loginError = signal<string | null>(null);
  isTauriComponent = true;

  #router = inject(Router);
  #authService = inject(AuthService);

  #firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  #auth = getAuth(this.#firebaseApp);

  constructor() {
    effect(() => {
      if (this.#authService.isLoggedIn()) {
        this.#router.navigate(['/patients']);
      }
    });
  }

  async loginWithGoogle(): Promise<void> {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.loginError.set(null);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(this.#auth, provider, browserPopupRedirectResolver);

      // Extraemos el Access Token emitido por Google
      const credentialResult = GoogleAuthProvider.credentialFromResult(result);
      const googleAccessToken = credentialResult?.accessToken;

      if (googleAccessToken) {
        if (typeof window !== 'undefined') {
          // token de Google original a la app de escritorio
          window.location.href = `vetlink-app://auth?token=${googleAccessToken}`;
        }
      } else {
        throw new Error('No se pudo recuperar el token nativo de Google.');
      }

      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.close();
        }
      }, 2000);
    } catch (error: unknown) {
      this.loginError.set(
        error instanceof Error ? error.message : 'Error al iniciar sesión con Google en Tauri'
      );
      console.error('Error en login externo de Tauri:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
