import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface CustomWindow extends Window {
  dataLayer?: Record<string, unknown>[];
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  #document = inject(DOCUMENT);

  trackEvent(eventName: string, params?: Record<string, unknown>): void {
    const windowContext = this.#document.defaultView as CustomWindow | null;

    if (windowContext) {
      windowContext.dataLayer = windowContext.dataLayer || [];
      windowContext.dataLayer.push({
        event: eventName,
        ...params,
      });
    }
  }
}
