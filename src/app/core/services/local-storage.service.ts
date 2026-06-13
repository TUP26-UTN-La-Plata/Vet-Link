import { Injectable } from '@angular/core';
import { CachedData } from './item.interface';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  save<T>(key: string, data: T, ttl?: number): void {
    const cachedData: CachedData<T> = {
      data,
      expiresAt: ttl ? Date.now() + ttl : 0,
    };

    try {
      localStorage.setItem(key, JSON.stringify(cachedData));
    } catch (error) {
      console.error(`Failed to save to localStorage with key "${key}":`, error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);

      if (!item) {
        return null;
      }

      const cachedData: CachedData<T> = JSON.parse(item);

      if (cachedData.expiresAt !== 0 && Date.now() > cachedData.expiresAt) {
        this.remove(key);
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.error(`Failed to retrieve from localStorage with key "${key}":`, error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage with key "${key}":`, error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}
