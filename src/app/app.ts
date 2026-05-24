import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  constructor(
    private primeng: PrimeNG,
    private translocoService: TranslocoService
  ) { }

  ngOnInit(): void {
    this.translocoService.selectTranslation().subscribe(translations => {
      if (translations && translations['primeng']) {
        this.primeng.setTranslation(translations['primeng']);
      }
    });
  }
}