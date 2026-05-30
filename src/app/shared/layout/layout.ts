import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavButton } from './nav-button/nav-button';
import { LayoutHeader } from './layout-header/layout-header';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet, NavButton, LayoutHeader, TranslocoModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout { }
