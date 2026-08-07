import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TranslocoModule, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { PatientsService } from '../patients.service';
import { Patient } from '../patients.interface';
import { UserRoleService } from '@core/services/user-role.service';

@Component({
  selector: 'app-patient-detail',
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    ProgressSpinnerModule,
    MessageModule,
    CardModule,
    InputTextModule,
    TextareaModule,
  ],
  providers: [provideTranslocoScope('patients')],
  templateUrl: './patient-detail.html',
  styleUrl: './patient-detail.css',
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  form!: FormGroup;
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #patientsService = inject(PatientsService);
  readonly #fb = inject(FormBuilder);
  readonly #cd = inject(ChangeDetectorRef);
  readonly #destroyRef = inject(DestroyRef);
  readonly #translocoService = inject(TranslocoService);
  readonly userRoleService = inject(UserRoleService);

  ngOnInit(): void {
    this.form = this.#fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      breed: [''],
      age: [0, [Validators.min(0)]],
      averageWeight: [0, [Validators.min(0)]],
      averageHeight: [0, [Validators.min(0)]],
      ownerName: [''],
      ownerEmail: ['', [Validators.email]],
      ownerPhone: [''],
      origin: [''],
      description: ['', [Validators.required]],
      temperament: [''],
      notes: [''],
      image: [''],
    });

    const patientId = Number(this.#route.snapshot.paramMap.get('id'));

    if (!patientId) {
      this.errorMessage = this.#getTranslation('patients.detail.notFound');
      return;
    }

    this.loadPatient(patientId);
  }

  loadPatient(patientId: number): void {
    this.loading = true;
    this.errorMessage = null;

    this.#patientsService
      .getPatients()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (patients) => {
          this.patient = patients.find((item) => item.id === patientId) ?? null;

          if (!this.patient) {
            this.errorMessage = this.#getTranslation('patients.detail.notFound');
            this.loading = false;
            this.#cd.detectChanges();
            return;
          }

          this.form.patchValue({
            name: this.patient.name,
            breed: this.patient.breed ?? this.patient.name,
            age: this.patient.age ?? 0,
            averageWeight: this.patient.averageWeight ?? 0,
            averageHeight: this.patient.averageHeight ?? 0,
            ownerName: this.patient.ownerName ?? '',
            ownerEmail: this.patient.ownerEmail ?? '',
            ownerPhone: this.patient.ownerPhone ?? '',
            origin: this.patient.origin ?? '',
            description: this.patient.description ?? '',
            temperament: this.patient.temperament ?? '',
            notes: this.patient.notes ?? '',
            image: this.patient.image ?? '',
          });

          if (!this.userRoleService.isVet) {
            this.form.disable();
          }

          this.loading = false;
          this.#cd.detectChanges();
        },
        error: () => {
          this.errorMessage = this.#getTranslation('patients.detail.loadError');
          this.loading = false;
          this.#cd.detectChanges();
        },
      });
  }

  onSubmit(): void {
    if (!this.userRoleService.isVet || this.form.invalid || !this.patient) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.successMessage = null;
    this.errorMessage = null;

    const rawForm = this.form.getRawValue();

    const changes: Partial<Patient> = {
      name: rawForm.name?.trim(),
      description: rawForm.description?.trim(),
      averageWeight: Number(rawForm.averageWeight ?? 0),
      averageHeight: Number(rawForm.averageHeight ?? 0),
      origin: rawForm.origin?.trim(),
      breed: rawForm.breed?.trim(),
      age: Number(rawForm.age ?? 0),
      ownerName: rawForm.ownerName?.trim(),
      ownerPhone: rawForm.ownerPhone?.trim(),
      temperament: rawForm.temperament?.trim(),
      notes: rawForm.notes?.trim(),
      image: rawForm.image?.trim(),
    };

    const ownerEmailValue = rawForm.ownerEmail?.trim();
    if (ownerEmailValue) {
      changes.ownerEmail = ownerEmailValue;
    }

    this.#patientsService
      .patchPatient(this.patient.id, changes)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.saving = false;
          this.successMessage = this.#getTranslation('patients.detail.saved');
          this.#cd.detectChanges();
          this.goBack();
        },
        error: (err) => {
          console.error('Error al actualizar paciente con PATCH:', err);
          this.saving = false;
          this.errorMessage =
            err?.error?.message || 'No se pudieron guardar los cambios del paciente.';
          this.#cd.detectChanges();
        },
      });
  }

  goBack(): void {
    this.#router.navigate(['/patients']);
  }

  #getTranslation(key: string): string {
    const translation = this.#translocoService.translate(key);
    return translation || key;
  }
}
