import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Owner } from './owners.interface';
import { TranslocoModule, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { PatientsStateService } from '../../core/services/items-state.service';
import { AsyncPipe } from '@angular/common';
import { UserRoleService } from '../../core/services/user-role.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-owners',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ProgressSpinnerModule,
    TranslocoModule,
    AsyncPipe,
    ConfirmDialogModule,
    DialogModule,
    ReactiveFormsModule,
  ],
  providers: [provideTranslocoScope('owners')],
  templateUrl: './owners.html',
  styleUrl: './owners.css',
})
export class OwnersComponent implements OnInit {
  readonly ownersState = inject(PatientsStateService);
  readonly userRoleService = inject(UserRoleService);
  readonly #confirmationService = inject(ConfirmationService);
  readonly #translocoService = inject(TranslocoService);
  readonly #fb = inject(FormBuilder);

  readonly owners$ = this.ownersState.owners$;
  readonly filteredOwners$ = this.ownersState.filteredOwners$;
  readonly loading$ = this.ownersState.loading$;
  readonly errorMessage$ = this.ownersState.errorMessage$;

  displayAddModal = false;
  savingOwner = false;
  addOwnerForm!: FormGroup;

  ngOnInit(): void {
    this.ownersState.getOwners().subscribe();

    this.addOwnerForm = this.#fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
      picture: [''],
      description: [''],
    });
  }

  filterOwners(event: Event): void {
    const searchText = (event.target as HTMLInputElement).value;
    this.ownersState.setOwnerSearchTerm(searchText);
  }

  trackByOwner(_: number, owner: Owner): string {
    return owner.id;
  }

  openAddModal(): void {
    this.addOwnerForm.reset();
    this.displayAddModal = true;
  }

  closeAddModal(): void {
    this.displayAddModal = false;
  }

  submitNewOwner(): void {
    if (this.addOwnerForm.invalid) {
      this.addOwnerForm.markAllAsTouched();
      return;
    }

    this.savingOwner = true;
    const formVal = this.addOwnerForm.value;

    const newOwnerPayload = {
      name: formVal.name.trim(),
      email: formVal.email.trim(),
      phone: formVal.phone.trim(),
      city: formVal.city.trim(),
      country: formVal.country.trim(),
      picture: formVal.picture?.trim() || undefined,
      description: formVal.description?.trim() || undefined,
    };

    this.ownersState.createOwner(newOwnerPayload).subscribe({
      next: () => {
        this.savingOwner = false;
        this.displayAddModal = false;
        this.addOwnerForm.reset();
      },
      error: (err) => {
        console.error('Error al crear propietario:', err);
        this.savingOwner = false;
      },
    });
  }

  confirmDeleteOwner(owner: Owner): void {
    this.#confirmationService.confirm({
      message: this.#translocoService.translate('owners.card.deleteMessage', { name: owner.name }),
      header: this.#translocoService.translate('owners.card.deleteTitle'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.#translocoService.translate('owners.card.deleteConfirm'),
      rejectLabel: this.#translocoService.translate('owners.card.deleteCancel'),
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: () => {
        this.ownersState.deleteOwner(owner.id).subscribe({
          error: (err) => console.error('Error al eliminar propietario:', err),
        });
      },
    });
  }
}
