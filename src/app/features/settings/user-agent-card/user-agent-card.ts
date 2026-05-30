import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { APP_VERSION } from '../../../shared/utils/app-version';
import { getClientEnvironment } from '../../../shared/utils/client-environment';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-user-agent-card',
  imports: [TranslocoModule],
  templateUrl: './user-agent-card.html',
  styleUrl: './user-agent-card.css',
})
export class UserAgentCard {
  private readonly platformId = inject(PLATFORM_ID);
  readonly appVersion = APP_VERSION;
  readonly browser = signal<string>('—');
  readonly os = signal<string>('—');
  readonly device = signal<string>('—');

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const { browser, os, device } = getClientEnvironment();
      this.browser.set(browser);
      this.os.set(os);
      this.device.set(device);
    });
  }
}
