import { Injectable, signal } from '@angular/core';

export interface SessionData {
  userId: string;
  loginTime: string;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private sessionKey = 'vetlink_session';
  isAuthenticated = signal(false);

  constructor() {
    this.checkSession();
  }

  private checkSession(): void {
    const session = sessionStorage.getItem(this.sessionKey);
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        this.isAuthenticated.set(sessionData.isAuthenticated);
      } catch (e) {
        this.clearSession();
      }
    }
  }

  getSession(): SessionData | null {
    const session = sessionStorage.getItem(this.sessionKey);
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  login(userId: string = 'user_' + Date.now()): void {
    const sessionData: SessionData = {
      userId,
      loginTime: new Date().toISOString(),
      isAuthenticated: true,
    };

    sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    this.isAuthenticated.set(true);
  }

  logout(): void {
    sessionStorage.removeItem(this.sessionKey);
    this.isAuthenticated.set(false);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  private clearSession(): void {
    sessionStorage.removeItem(this.sessionKey);
    this.isAuthenticated.set(false);
  }
}
