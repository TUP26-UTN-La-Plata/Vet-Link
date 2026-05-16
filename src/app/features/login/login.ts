import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  isLoading = signal(false);
  loginError = signal<string | null>(null);

  #router: Router;
  #authService: AuthService;

  constructor(
    router: Router,
    authService: AuthService
  ) {
    this.#router = router;
    this.#authService = authService;
  }

  ngOnInit(): void {
    this.#checkExistingSession();
  }

  #checkExistingSession(): void {
    if (this.#authService.isLoggedIn()) {
      this.#router.navigate(['/patients']);
    }
  }

  handleLogin(): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    setTimeout(() => {
      this.#authService.login();
      this.isLoading.set(false);
      this.#router.navigate(['/patients']);
    }, 2000);
  }

  async loginWithGoogle(): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.loginError.set(null);

    try {
      await this.#authService.loginWithGoogle();
      this.isLoading.set(false);
      this.#router.navigate(['/patients']);
    } catch (error: any) {
      this.isLoading.set(false);
      this.loginError.set(
        error?.message || 'Error al iniciar sesión con Google'
      );
      console.error('Error en login con Google:', error);
    }
  }
}

