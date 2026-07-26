import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Patient } from '../../features/patients/patients.interface';
import { Owner } from '../../features/owners/owners.interface';
import { LocalStorageService } from './local-storage.service';
import { PatientsApiService } from './items-api.service';
import { OwnersService } from './owners.service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class PatientsStateService {
  readonly #CACHE_KEY = 'patients_cache';
  readonly #CACHE_TTL = 5 * 60 * 1000;
  readonly #OWNERS_CACHE_KEY = 'owners';
  readonly #localStorageService = inject(LocalStorageService);
  readonly #patientsApiService = inject(PatientsApiService);
  readonly #ownersService = inject(OwnersService);
  readonly #translocoService = inject(TranslocoService);

  readonly #patientsSubject = new BehaviorSubject<Patient[]>([]);
  readonly #ownersSubject = new BehaviorSubject<Owner[]>([]);
  readonly #ownersSearchTermSubject = new BehaviorSubject('');
  readonly #loadingSubject = new BehaviorSubject(false);
  readonly #errorMessageSubject = new BehaviorSubject<string | null>(null);

  readonly patients$ = this.#patientsSubject.asObservable();
  readonly owners$ = this.#ownersSubject.asObservable();
  readonly ownersSearchTerm$ = this.#ownersSearchTermSubject.asObservable();
  readonly loading$ = this.#loadingSubject.asObservable();
  readonly errorMessage$ = this.#errorMessageSubject.asObservable();
  readonly filteredOwners$ = combineLatest([this.owners$, this.ownersSearchTerm$]).pipe(
    map(([owners, searchTerm]) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();

      if (!normalizedSearch) {
        return owners;
      }

      return owners.filter((owner) => {
        return (
          owner.name.toLowerCase().includes(normalizedSearch) ||
          owner.email.toLowerCase().includes(normalizedSearch) ||
          owner.location.toLowerCase().includes(normalizedSearch)
        );
      });
    })
  );

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

  getOwners(): Observable<Owner[]> {
    const cachedOwners = this.#localStorageService.get<Owner[]>(this.#OWNERS_CACHE_KEY);

    if (cachedOwners?.length) {
      this.#ownersSubject.next(cachedOwners);
      this.#errorMessageSubject.next(null);
      return of(cachedOwners);
    }

    this.#loadingSubject.next(true);
    this.#errorMessageSubject.next(null);

    return this.#ownersService.getOwners().pipe(
      tap((owners) => {
        this.#localStorageService.save(this.#OWNERS_CACHE_KEY, owners, this.#CACHE_TTL);
        this.#ownersSubject.next(owners);
        this.#loadingSubject.next(false);
      }),
      catchError((error) => {
        console.error('Error al obtener propietarios de la API:', error);
        this.#loadingSubject.next(false);
        this.#errorMessageSubject.next(this.#translocoService.translate('owners.errors.loadFail'));
        return throwError(() => error);
      })
    );
  }

  getCurrentOwners(): Owner[] {
    return this.#ownersSubject.value;
  }

  setOwnerSearchTerm(term: string): void {
    this.#ownersSearchTermSubject.next(term);
  }

  clearOwnersCache(): void {
    this.#localStorageService.remove(this.#OWNERS_CACHE_KEY);
    this.#ownersSubject.next([]);
    this.#ownersSearchTermSubject.next('');
    this.#errorMessageSubject.next(null);
  }

  refreshOwners(): Observable<Owner[]> {
    this.clearOwnersCache();
    return this.getOwners();
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

    const cachedOwners = this.#localStorageService.get<Owner[]>(this.#OWNERS_CACHE_KEY);
    if (cachedOwners?.length) {
      this.#ownersSubject.next(cachedOwners);
    }
  }
}
