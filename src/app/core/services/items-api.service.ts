import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DogApiBreed, Patient } from '../../features/patients/patients.interface';

/**
 * Servicio encargado exclusivamente de las llamadas HTTP a la API de Patients.
 * Responsabilidad única: realizar peticiones HTTP y mapear respuestas.
 */
@Injectable({
  providedIn: 'root',
})
export class PatientsApiService {
  private readonly API_URL = 'https://api.thedogapi.com/v1/breeds';
  private readonly API_KEY =
    'live_ePinWLFEmQECQTjlVDJ8yZQ6f3j8c92HdxPwQKwMKgO6cEdnoETYF2Q2ojviwcUa';
  private readonly http = inject(HttpClient);

  /**
   * Obtiene la lista completa de pacientes (razas) desde The Dog API.
   * @returns
   */
  getPatients(): Observable<Patient[]> {
    const headers = new HttpHeaders({
      'x-api-key': this.API_KEY,
    });

    return this.http
      .get<DogApiBreed[]>(this.API_URL, { headers })
      .pipe(
        map((apiData: DogApiBreed[]) => apiData.map((item: DogApiBreed) => this.mapToPatient(item)))
      );
  }

  /**
   * Mapea la respuesta de la API al modelo Patient.
   * @param item
   * @returns
   */
  private mapToPatient(item: DogApiBreed): Patient {
    const imageUrl =
      item.image?.url ||
      (item.reference_image_id
        ? `https://cdn2.thedogapi.com/images/${item.reference_image_id}.jpg`
        : 'no-image.webp');

    return {
      id: Number(item.id),
      name: item.name,
      image: imageUrl,
      description: item.description || item.temperament || item.bred_for || 'Sin descripción',
      averageWeight: this.calculateAverage(item.weight?.metric),
      averageHeight: this.calculateAverage(item.height?.metric),
      origin: item.origin || 'Desconocido',
    };
  }

  /**
   * Calcula el promedio de un rango (ej: "10 - 20" → 15).
   * @param range
   * @returns
   */
  private calculateAverage(range?: string): number {
    if (!range) return 0;

    const numbers = range.match(/\d+(\.\d+)?/g)?.map(Number);

    if (!numbers || numbers.length === 0) return 0;

    const sum = numbers.reduce((acc, val) => acc + val, 0);
    const avg = sum / numbers.length;

    return Number(avg.toFixed(0));
  }
}
