import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  #primeng = inject(PrimeNG);
  #translocoService = inject(TranslocoService);

  ngOnInit(): void {
    this.#translocoService.selectTranslation().subscribe((translations) => {
      if (translations && translations['primeng']) {
        this.#primeng.setTranslation(translations['primeng']);
      }
    });
  }
}
