import { Injectable } from '@angular/core';
import { CachedData } from './item.interface';

/**
 * Servicio encargado de manejar todas las operaciones con localStorage.
 * Proporciona métodos para guardar, recuperar y eliminar datos con soporte de TTL.
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  /**
   * Guarda datos en localStorage con opción de TTL (tiempo de expiración).
   * @param key - Clave para identificar el dato
   * @param data - Datos a guardar
   * @param ttl - Tiempo de vida en milisegundos
   */
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

  /**
   * Recupera datos de localStorage validando si han expirado.
   * @param key
   * @returns
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);

      if (!item) {
        return null;
      }

      const cachedData: CachedData<T> = JSON.parse(item);

      // Validar si el dato ha expirado
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

  /**
   * Elimina un dato específico de localStorage.
   * @param key - Clave del dato a eliminar
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage with key "${key}":`, error);
    }
  }

  /**
   * Limpia completamente el localStorage.
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}
