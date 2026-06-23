import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Owner, RandomUserApiResponse, RandomUserResult } from './owners.interface';

@Injectable({
  providedIn: 'root',
})
export class ownersService {
  readonly #API_URL = 'https://randomuser.me/api/?results=12&nat=es,us,fr,mx,ar';
  readonly #http = inject(HttpClient);

  getOwners(): Observable<Owner[]> {
    return this.#http
      .get<RandomUserApiResponse>(this.#API_URL)
      .pipe(map((response) => response.results.map((owner) => this.#mapToOwner(owner))));
  }

  #mapToOwner(owner: RandomUserResult): Owner {
    const picture = owner.picture.large || owner.picture.medium || '/no-image.webp';
    const name = `${owner.name.first} ${owner.name.last}`;
    const location = `${owner.location.city}, ${owner.location.country}`;

    return {
      id: owner.login.uuid,
      name,
      email: owner.email,
      phone: owner.phone,
      location,
      city: owner.location.city,
      country: owner.location.country,
      picture,
      description: `Propietario de ${owner.location.city} (${owner.location.country}) con historial de contacto confiable.`,
    };
  }
}
