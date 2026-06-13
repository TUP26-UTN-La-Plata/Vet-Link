export interface ClientEnvironment {
  browser: string;
  os: string;
  device: string;
}

interface NavigatorUADataBrands {
  brands: { brand: string; version: string }[];
  mobile: boolean;
  platform: string;
}

function formatHintBrowser(brands: { brand: string; version: string }[]): string {
  const filtered = brands.filter((b) => !/not.?a.?brand/i.test(b.brand));
  const main =
    filtered.find((b) => !/^chromium$/i.test(b.brand)) ??
    filtered.find((b) => /^chromium$/i.test(b.brand)) ??
    filtered[0];
  return main ? `${main.brand} ${main.version}` : '';
}

function parseBrowserFromUa(ua: string): string {
  if (/Edg\/(\d+)/i.test(ua)) {
    const m = ua.match(/Edg\/(\d+)/i);
    return m ? `Microsoft Edge ${m[1]}` : 'Microsoft Edge';
  }
  if (/OPR\/(\d+)/i.test(ua)) {
    const m = ua.match(/OPR\/(\d+)/i);
    return m ? `Opera ${m[1]}` : 'Opera';
  }
  if (/Firefox\/(\d+)/i.test(ua)) {
    const m = ua.match(/Firefox\/(\d+)/i);
    return m ? `Firefox ${m[1]}` : 'Firefox';
  }
  if (/Chrome\/(\d+)/i.test(ua) && !/Edg|OPR/i.test(ua)) {
    const m = ua.match(/Chrome\/(\d+)/i);
    return m ? `Chrome ${m[1]}` : 'Chrome';
  }
  if (/Safari\/\d+/i.test(ua) && !/Chrome/i.test(ua)) {
    const m = ua.match(/Version\/(\d+)/i);
    return m ? `Safari ${m[1]}` : 'Safari';
  }
  return 'Desconocido';
}

function parseOsFromUa(ua: string): string {
  if (/Windows NT 10\.0/i.test(ua)) return 'Windows 10 o superior';
  if (/Windows NT 6\.3/i.test(ua)) return 'Windows 8.1';
  if (/Windows NT 6\.2/i.test(ua)) return 'Windows 8';
  if (/Windows NT 6\.1/i.test(ua)) return 'Windows 7';
  if (/Windows/i.test(ua)) return 'Windows';
  const mac = ua.match(/Mac OS X (\d+[._]\d+)/i);
  if (mac) return `macOS ${mac[1].replace('_', '.')}`;
  if (/Mac OS X/i.test(ua)) return 'macOS';
  const ios = ua.match(/iPhone OS (\d+[_\d]*)/i);
  if (ios) return `iOS ${ios[1].replace(/_/g, '.')}`;
  if (/iPhone|iPod/i.test(ua)) return 'iOS';
  if (/iPad/i.test(ua)) {
    const v = ua.match(/OS (\d+[_\d]*)/i);
    return v ? `iPadOS ${v[1].replace(/_/g, '.')}` : 'iPadOS';
  }
  const android = ua.match(/Android (\d+[\d.]*)/i);
  if (android) return `Android ${android[1]}`;
  if (/Android/i.test(ua)) return 'Android';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Desconocido';
}

function detectDeviceType(ua: string, hintMobile?: boolean): string {
  if (/iPad/i.test(ua)) return 'Tableta';
  if (hintMobile === true) return 'Móvil';
  if (/Mobi|Android.*Mobile|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return 'Móvil';
  }
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return 'Tableta';
  return 'Escritorio';
}

function readUserAgentData(nav: Navigator): NavigatorUADataBrands | undefined {
  const d = (nav as Navigator & { userAgentData?: NavigatorUADataBrands }).userAgentData;
  if (!d || !Array.isArray(d.brands)) return undefined;
  return d;
}

export function getClientEnvironment(): ClientEnvironment {
  const ua = navigator.userAgent;
  const hints = readUserAgentData(navigator);

  if (hints) {
    const browser = formatHintBrowser(hints.brands) || parseBrowserFromUa(ua);
    const os = hints.platform || parseOsFromUa(ua);
    const device = detectDeviceType(ua, hints.mobile);
    return { browser, os, device };
  }

  return {
    browser: parseBrowserFromUa(ua),
    os: parseOsFromUa(ua),
    device: detectDeviceType(ua),
  };
}
