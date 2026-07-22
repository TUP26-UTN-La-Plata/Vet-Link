import { Component, inject, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { TranslocoService } from '@jsverse/transloco';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import * as Sentry from '@sentry/angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [MessageService],
})
export class App implements OnInit {
  #primeng = inject(PrimeNG);
  #translocoService = inject(TranslocoService);
  #messageService = inject(MessageService);
  isOffline = false;

  ngOnInit(): void {
    this.isOffline = !navigator.onLine;

    this.#translocoService.selectTranslation().subscribe((translations) => {
      if (translations && translations['primeng']) {
        this.#primeng.setTranslation(translations['primeng']);
      }

      if (this.isOffline) {
        this.showOfflineToast();
      }
    });
  }

  @HostListener('window:online')
  onOnline() {
    this.isOffline = false;
    this.#messageService.clear();
    this.#messageService.add({
      severity: 'success',
      summary: this.#translocoService.translate('online.summary'),
      detail: this.#translocoService.translate('online.detail'),
      life: 4000,
    });
  }

  @HostListener('window:offline')
  onOffline() {
    this.isOffline = true;
    this.showOfflineToast();
  }

  private showOfflineToast() {
    this.#messageService.add({
      key: 'offline-toast',
      severity: 'warn',
      summary: this.#translocoService.translate('offline.summary'),
      detail: this.#translocoService.translate('offline.detail'),
      sticky: true,
    });
  }

  public throwTestError(): void {
    // Send a log before throwing the error
    Sentry.logger.info(Sentry.logger.fmt`User ${'sentry-test'} triggered test error button`, {
      action: 'test_error_button_click',
    });
    // Send a test metric before throwing the error
    Sentry.metrics.count('test_counter', 1);
    throw new Error('Sentry Test Error');
  }
}
