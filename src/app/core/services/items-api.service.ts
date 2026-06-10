import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DogApiBreed, Patient } from '../../features/patients/patients.interface';

@Injectable({
  providedIn: 'root',
})
export class PatientsApiService {
  readonly #API_URL = 'https://api.thedogapi.com/v1/breeds';
  readonly #API_KEY = 'live_ePinWLFEmQECQTjlVDJ8yZQ6f3j8c92HdxPwQKwMKgO6cEdnoETYF2Q2ojviwcUa';
  readonly #http = inject(HttpClient);

  getPatients(): Observable<Patient[]> {
    const headers = new HttpHeaders({
      'x-api-key': this.#API_KEY,
    });

    return this.#http
      .get<DogApiBreed[]>(this.#API_URL, { headers })
      .pipe(
        map((apiData: DogApiBreed[]) =>
          apiData.map((item: DogApiBreed) => this.#mapToPatient(item))
        )
      );
  }

  #mapToPatient(item: DogApiBreed): Patient {
    const imageUrl =
      item.image?.url ||
      (item.reference_image_id
        ? `https://cdn2.thedogapi.com/images/${item.reference_image_id}.jpg`
        : 'no-image.webp');

    return {
      id: Number(item.id),
      name: item.name,
      image: imageUrl,
      description:
        item.description || item.temperament || item.bred_for || 'patients.no_description',
      averageWeight: this.#calculateAverage(item.weight?.metric),
      averageHeight: this.#calculateAverage(item.height?.metric),
      origin: item.origin || 'patients.unknown',
    };
  }

  #calculateAverage(range?: string): number {
    if (!range) return 0;

    const numbers = range.match(/\d+(\.\d+)?/g)?.map(Number);

    if (!numbers || numbers.length === 0) return 0;

    const sum = numbers.reduce((acc, val) => acc + val, 0);
    const avg = sum / numbers.length;

    return Number(avg.toFixed(0));
  }
}
