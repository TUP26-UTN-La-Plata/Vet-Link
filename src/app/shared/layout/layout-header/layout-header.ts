import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-layout-header',
  imports: [TranslocoModule],
  templateUrl: './layout-header.html',
  styleUrl: './layout-header.css',
})
export class LayoutHeader {
  protected readonly authService = inject(AuthService);
}
