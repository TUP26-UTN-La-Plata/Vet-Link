import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavButton } from './nav-button/nav-button';
import { LayoutHeader } from './layout-header/layout-header';
import { TranslocoModule } from '@jsverse/transloco';
import { APP_VERSION } from '../utils/app-version';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet, NavButton, LayoutHeader, TranslocoModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  readonly appVersion = APP_VERSION;
}
