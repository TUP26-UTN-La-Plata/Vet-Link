import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient } from '../../features/patients/patients.interface';

@Injectable({
  providedIn: 'root',
})
export class PatientsApiService {
  readonly #apiUrl = `${environment.apiUrl}/patients`;
  readonly #http = inject(HttpClient);

  getPatients(): Observable<Patient[]> {
    return this.#http.get<Patient[]>(this.#apiUrl);
  }

  getPatientById(id: string | number): Observable<Patient> {
    return this.#http.get<Patient>(`${this.#apiUrl}/${id}`);
  }

  createPatient(patient: Partial<Patient>): Observable<Patient> {
    return this.#http.post<Patient>(this.#apiUrl, patient);
  }

  updatePatient(id: string | number, patient: Partial<Patient>): Observable<Patient> {
    return this.#http.put<Patient>(`${this.#apiUrl}/${id}`, patient);
  }

  patchPatient(id: string | number, changes: Partial<Patient>): Observable<Patient> {
    return this.#http.patch<Patient>(`${this.#apiUrl}/${id}`, changes);
  }

  deletePatient(id: string | number): Observable<void> {
    return this.#http.delete<void>(`${this.#apiUrl}/${id}`);
  }
}
