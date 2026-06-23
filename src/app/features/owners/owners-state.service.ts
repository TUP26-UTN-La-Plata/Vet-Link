import { Injectable, computed, inject, signal } from '@angular/core';
import { take } from 'rxjs';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { Owner } from './owners.interface';
import { OwnersService } from './owners.service';

@Injectable({
  providedIn: 'root',
})
export class OwnersStateService {
  readonly #ownersService = inject(OwnersService);
  readonly #localStorageService = inject(LocalStorageService);

  readonly #owners = signal<Owner[]>([]);
  readonly #loading = signal(false);
  readonly #errorMessage = signal<string | null>(null);
  readonly #searchTerm = signal('');

  readonly owners = this.#owners.asReadonly();
  readonly loading = this.#loading.asReadonly();
  readonly errorMessage = this.#errorMessage.asReadonly();
  readonly searchTerm = this.#searchTerm.asReadonly();

  readonly filteredOwners = computed(() => {
    const searchText = this.#searchTerm().trim().toLowerCase();
    const owners = this.#owners();

    if (!searchText) {
      return owners;
    }

    return owners.filter((owner) => {
      return (
        owner.name.toLowerCase().includes(searchText) ||
        owner.email.toLowerCase().includes(searchText) ||
        owner.location.toLowerCase().includes(searchText)
      );
    });
  });

  loadOwners(): void {
    if (this.#owners().length) {
      return;
    }

    const cachedOwners = this.#localStorageService.get<Owner[]>('owners');

    if (cachedOwners?.length) {
      this.#owners.set(cachedOwners);
      this.#errorMessage.set(null);
      return;
    }

    this.#loading.set(true);
    this.#errorMessage.set(null);

    this.#ownersService
      .getOwners()
      .pipe(take(1))
      .subscribe({
        next: (owners) => {
          this.#owners.set(owners);
          this.#localStorageService.save('owners', owners);
          this.#loading.set(false);
        },
        error: (error) => {
          console.error('Error al cargar propietarios:', error);
          this.#errorMessage.set(
            'Lo sentimos, no pudimos cargar la lista de propietarios. Por favor, intenta nuevamente.'
          );
          this.#loading.set(false);
        },
      });
  }

  setSearchTerm(term: string): void {
    this.#searchTerm.set(term);
  }

  clearSearch(): void {
    this.#searchTerm.set('');
  }
}
