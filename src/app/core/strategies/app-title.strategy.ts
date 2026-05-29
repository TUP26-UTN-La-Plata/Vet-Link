import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
    #titleService = inject(Title);
    #translocoService = inject(TranslocoService);

    override updateTitle(routerState: RouterStateSnapshot) {
        const titleKey = this.buildTitle(routerState);

        if (titleKey) {
            this.#translocoService.selectTranslate(titleKey).subscribe(translatedTitle => {
                this.#titleService.setTitle(translatedTitle || 'Vet-Link');
            });
        } else {
            this.#titleService.setTitle('Vet-Link');
        }
    }
}