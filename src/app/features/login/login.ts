import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
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
      // Redirige automáticamente si el estado de autenticación ya está inicializado
      // y el usuario ya está logueado. Esto evita usar un flag adicional
      // para controlar intentos de login.
      if (
        this.#authService.isAuthInitialized() &&
        this.#authService.isLoggedIn()
      ) {
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
    } catch (error: any) {
      this.loginError.set(
        error?.message || 'Error al iniciar sesión con Google'
      );
      console.error('Error en login:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}

