import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export type NavButtonVariant = 'sidebar' | 'bottom';

@Component({
  selector: 'app-nav-button',
  imports: [RouterModule],
  templateUrl: './nav-button.html',
  styleUrl: './nav-button.css',
})
export class NavButton {
  @Input({ required: true }) label: string = 'NavButton';
  @Input({ required: true }) icon: string = 'pi pi-home';
  @Input({ required: true }) routerLink: string = '/';
  /** `bottom`: icon + label stacked for mobile tab bar */
  @Input() variant: NavButtonVariant = 'sidebar';
}
