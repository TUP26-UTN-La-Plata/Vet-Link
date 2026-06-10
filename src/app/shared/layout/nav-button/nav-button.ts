import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

export type NavButtonVariant = 'sidebar' | 'bottom';

@Component({
  selector: 'app-nav-button',
  imports: [RouterModule, TranslocoModule],
  templateUrl: './nav-button.html',
  styleUrl: './nav-button.css',
})
export class NavButton {
  @Input({ required: true }) label = 'NavButton';
  @Input({ required: true }) icon = 'pi pi-home';
  @Input({ required: true }) routerLink = '/';
  @Input() variant: NavButtonVariant = 'sidebar';
}
