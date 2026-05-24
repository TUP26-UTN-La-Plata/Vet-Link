import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-layout-header',
  imports: [TranslocoModule],
  templateUrl: './layout-header.html',
  styleUrl: './layout-header.css',
})
export class LayoutHeader { }
