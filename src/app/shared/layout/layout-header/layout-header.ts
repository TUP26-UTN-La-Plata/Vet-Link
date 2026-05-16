import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-layout-header',
  imports: [],
  templateUrl: './layout-header.html',
  styleUrl: './layout-header.css',
})
export class LayoutHeader {
  protected readonly authService = inject(AuthService);
}
