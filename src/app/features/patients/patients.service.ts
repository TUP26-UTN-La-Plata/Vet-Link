import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from './patients.interface';
import { PatientsStateService } from '../../core/services/items-state.service';
import { PatientsApiService } from '../../core/services/items-api.service';

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  readonly #patientsStateService = inject(PatientsStateService);
  readonly #patientsApiService = inject(PatientsApiService);

  readonly patients$ = this.#patientsStateService.patients$;

  getPatients(): Observable<Patient[]> {
    return this.#patientsStateService.getPatients();
  }

  getPatientById(id: string | number): Observable<Patient> {
    return this.#patientsApiService.getPatientById(id);
  }

  createPatient(patient: Partial<Patient>): Observable<Patient> {
    return this.#patientsStateService.createPatient(patient);
  }

  updatePatient(patient: Patient): Observable<Patient> {
    return this.#patientsStateService.updatePatient(patient);
  }

  patchPatient(id: string | number, changes: Partial<Patient>): Observable<Patient> {
    return this.#patientsStateService.patchPatient(id, changes);
  }

  deletePatient(id: string | number): Observable<void> {
    return this.#patientsStateService.deletePatient(id);
  }
}
