import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Owner } from '../../features/owners/owners.interface';

@Injectable({
  providedIn: 'root',
})
export class OwnersService {
  readonly #apiUrl = `${environment.apiUrl}/owners`;
  readonly #http = inject(HttpClient);

  getOwners(): Observable<Owner[]> {
    return this.#http.get<Owner[]>(this.#apiUrl);
  }
  getOwnerById(id: string): Observable<Owner> {
    return this.#http.get<Owner>(`${this.#apiUrl}/${id}`);
  }

  createOwner(owner: Omit<Owner, 'id' | 'location'>): Observable<Owner> {
    return this.#http.post<Owner>(this.#apiUrl, owner);
  }

  updateOwner(id: string, owner: Omit<Owner, 'id' | 'location'>): Observable<Owner> {
    return this.#http.put<Owner>(`${this.#apiUrl}/${id}`, owner);
  }

  deleteOwner(id: string): Observable<void> {
    return this.#http.delete<void>(`${this.#apiUrl}/${id}`);
  }
}
