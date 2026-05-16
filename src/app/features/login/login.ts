import { Component, OnInit, signal, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  isLoading = signal(false);
  loginError = signal<string | null>(null);
  #hasAttemptedLogin = signal(false);

  #router = inject(Router);
  #authService = inject(AuthService);

  constructor() {
    effect(() => {
      const isAuthenticated = this.#authService.isLoggedIn();
      const hasAttempted = this.#hasAttemptedLogin();

      if (isAuthenticated && hasAttempted) {
        this.#router.navigate(['/patients']);
        this.#hasAttemptedLogin.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.#checkExistingSession();
  }

  #checkExistingSession(): void {
    if (this.#authService.isLoggedIn()) {
      this.#router.navigate(['/patients']);
    }
  }

  async handleLogin(): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.loginError.set(null);

    try {
      this.#hasAttemptedLogin.set(true);
      await this.#authService.loginWithGoogle();
    } catch (error: any) {
      this.#hasAttemptedLogin.set(false);
      this.loginError.set(
        error?.message || 'Error al iniciar sesión con Google'
      );
      console.error('Error en login:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginWithGoogle(): Promise<void> {
    await this.handleLogin();
  }
}

