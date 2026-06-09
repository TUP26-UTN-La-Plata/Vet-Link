import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from './patients.interface';
import { PatientsStateService } from '../../core/services/items-state.service';

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  readonly #patientsStateService = inject(PatientsStateService);

  getPatients(): Observable<Patient[]> {
    return this.#patientsStateService.getPatients();
  }
}
