import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Patient } from '../../features/patients/patients.interface';
import { LocalStorageService } from './local-storage.service';
import { PatientsApiService } from './items-api.service';

/**
 * Servicio de estado que maneja la lógica de obtención de pacientes.
 * Implementa un sistema de caché inteligente con soporte de TTL.
 * 
 * Flujo:
 * 1. Componente solicita pacientes → getPatients()
 * 2. Verifica caché local
 * 3. Si existe y es válido → devuelve del caché
 * 4. Si no → llama a PatientsApiService (HTTP)
 * 5. Guarda resultado en localStorage con TTL
 * 6. Actualiza BehaviorSubject
 * 7. Componente se suscribe y recibe datos
 */
@Injectable({
  providedIn: 'root'
})
export class PatientsStateService {
  private readonly CACHE_KEY = 'patients_cache';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

  // BehaviorSubject para mantener el estado actual en memoria
  private patientsSubject = new BehaviorSubject<Patient[]>([]);

  // Observable público para que los componentes se suscriban
  public patients$ = this.patientsSubject.asObservable();

  constructor(
    private localStorageService: LocalStorageService,
    private patientsApiService: PatientsApiService
  ) {
    this.initializeState();
  }

  /**
   * Método principal que devuelve los pacientes.
   * Implementa la lógica: caché → API → guardar en caché
   * @returns
   */
  getPatients(): Observable<Patient[]> {
    const cachedPatients = this.localStorageService.get<Patient[]>(this.CACHE_KEY);

    if (cachedPatients) {
      this.patientsSubject.next(cachedPatients);
      return this.patients$;
    }

    return this.patientsApiService.getPatients().pipe(
      tap(patients => {
        this.localStorageService.save(this.CACHE_KEY, patients, this.CACHE_TTL);
        this.patientsSubject.next(patients);
      }),
      catchError(error => {
        console.error('Error al obtener pacientes de la API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene el estado actual de los pacientes sin hacer llamadas HTTP.
   * @returns 
   */
  getCurrentPatients(): Patient[] {
    return this.patientsSubject.value;
  }

   /* Limpia el caché y el estado actual de pacientes.
   */
  clearCache(): void {
    this.localStorageService.remove(this.CACHE_KEY);
    this.patientsSubject.next([]);
  }

  /**
   * Fuerza una recarga de pacientes desde la API,
   * @returns
   */
  refreshPatients(): Observable<Patient[]> {
    this.clearCache();
    return this.getPatients();
  }

  /**
   * Inicializa el estado cargando pacientes del caché si existen.
   * Se ejecuta automáticamente en el constructor.
   */
  private initializeState(): void {
    const cachedPatients = this.localStorageService.get<Patient[]>(this.CACHE_KEY);
    if (cachedPatients) {
      this.patientsSubject.next(cachedPatients);
    }
  }
}
