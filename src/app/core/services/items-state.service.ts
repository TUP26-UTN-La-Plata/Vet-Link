import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Patient } from '../../features/patients/patients.interface';
import { LocalStorageService } from './local-storage.service';
import { PatientsApiService } from './items-api.service';

@Injectable({
  providedIn: 'root',
})
export class PatientsStateService {
  readonly #CACHE_KEY = 'patients_cache';
  readonly #CACHE_TTL = 5 * 60 * 1000;
  readonly #localStorageService = inject(LocalStorageService);
  readonly #patientsApiService = inject(PatientsApiService);

  readonly #patientsSubject = new BehaviorSubject<Patient[]>([]);
  readonly patients$ = this.#patientsSubject.asObservable();

  constructor() {
    this.initializeState();
  }

  getPatients(): Observable<Patient[]> {
    const cachedPatients = this.#localStorageService.get<Patient[]>(this.#CACHE_KEY);

    if (cachedPatients?.length) {
      this.#patientsSubject.next(cachedPatients);
      return of(cachedPatients);
    }

    return this.#patientsApiService.getPatients().pipe(
      tap((patients) => {
        this.#localStorageService.save(this.#CACHE_KEY, patients, this.#CACHE_TTL);
        this.#patientsSubject.next(patients);
      }),
      catchError((error) => {
        console.error('Error al obtener pacientes de la API:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentPatients(): Patient[] {
    return this.#patientsSubject.value;
  }

  updatePatient(updatedPatient: Patient): void {
    const currentPatients = this.#patientsSubject.value;
    const existingPatientIndex = currentPatients.findIndex(
      (patient) => patient.id === updatedPatient.id
    );

    const nextPatients =
      existingPatientIndex >= 0
        ? currentPatients.map((patient) =>
            patient.id === updatedPatient.id ? updatedPatient : patient
          )
        : [...currentPatients, updatedPatient];

    this.#patientsSubject.next(nextPatients);
    this.#localStorageService.save(this.#CACHE_KEY, nextPatients, this.#CACHE_TTL);
  }

  /* Limpia el caché y el estado actual de pacientes.
   */
  clearCache(): void {
    this.#localStorageService.remove(this.#CACHE_KEY);
    this.#patientsSubject.next([]);
  }

  refreshPatients(): Observable<Patient[]> {
    this.clearCache();
    return this.getPatients();
  }

  private initializeState(): void {
    const cachedPatients = this.#localStorageService.get<Patient[]>(this.#CACHE_KEY);
    if (cachedPatients?.length) {
      this.#patientsSubject.next(cachedPatients);
    }
  }
}
