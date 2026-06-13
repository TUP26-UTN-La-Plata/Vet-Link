import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { provideTranslocoScope, TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-login',
  imports: [CommonModule, TranslocoModule],
  providers: [provideTranslocoScope('login')],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  isLoading = signal(false);
  loginError = signal<string | null>(null);

  #router = inject(Router);
  #authService = inject(AuthService);

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

    try {
      await this.#authService.loginWithGoogle();
    } catch (error: unknown) {
      this.loginError.set(
        error instanceof Error ? error.message : 'Error al iniciar sesión con Google'
      );
      console.error('Error en login:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
