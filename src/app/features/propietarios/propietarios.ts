import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PropietariosService } from './propietarios.service';
import { Owner } from './propietarios.interface';

@Component({
  selector: 'app-propietarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './propietarios.html',
  styleUrl: './propietarios.css',
  providers: [PropietariosService],
})
export class Propietarios implements OnInit {
  owners: Owner[] = [];
  filteredOwners: Owner[] = [];
  loading = false;
  errorMessage: string | null = null;

  readonly #ownersService = inject(PropietariosService);
  readonly #cd = inject(ChangeDetectorRef);
  readonly #destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadOwners();
  }

  loadOwners(): void {
    this.loading = true;
    this.errorMessage = null;

    this.#ownersService
      .getOwners()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (owners) => {
          this.owners = owners;
          this.filteredOwners = [...owners];
          this.loading = false;
          this.#cd.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar propietarios:', error);
          this.errorMessage =
            'Lo sentimos, no pudimos cargar la lista de propietarios. Por favor, intenta nuevamente.';
          this.loading = false;
          this.#cd.detectChanges();
        },
      });
  }

  filterOwners(event: Event): void {
    const searchText = (event.target as HTMLInputElement).value.toLowerCase().trim();

    if (!searchText) {
      this.filteredOwners = [...this.owners];
      return;
    }

    this.filteredOwners = this.owners.filter((owner) => {
      return (
        owner.name.toLowerCase().includes(searchText) ||
        owner.email.toLowerCase().includes(searchText) ||
        owner.location.toLowerCase().includes(searchText)
      );
    });
  }

  trackByOwner(index: number, owner: Owner): string {
    return owner.id;
  }
}
