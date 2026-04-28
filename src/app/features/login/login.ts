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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkExistingSession();
  }

  /**
   * Verifica si existe una sesión activa
   * Si existe, redirige a la vista principal
   */
  private checkExistingSession(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/patients']);
    }
  }

  /**
   * Maneja el click del botón de inicio de sesión
   * Simula una verificación de 2 segundos y luego crea una sesión
   */
  handleLogin(): void {
    if (this.isLoading()) return; // Evita múltiples clics

    this.isLoading.set(true);

    // Simula verificación de usuario por 2 segundos
    setTimeout(() => {
      // Crear sesión mediante el servicio
      this.authService.login();

      // Redirigir a la vista principal
      this.isLoading.set(false);
      this.router.navigate(['/patients']);
    }, 2000);
  }
}

