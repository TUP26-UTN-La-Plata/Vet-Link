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

  ngOnInit(): void {}

  handleLogin(): void {
    if (this.isLoading()) return; // Evita múltiples clics

    this.isLoading.set(true);

    setTimeout(() => {
      this.authService.login();
      this.isLoading.set(false);
      this.router.navigate(['/patients']);
    }, 2000);
  }
}

