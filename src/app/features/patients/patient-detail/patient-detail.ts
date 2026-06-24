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
      this.errorMessage = this.#getTranslation('detail.notFound');
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
            this.errorMessage = this.#getTranslation('detail.notFound');
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

          this.loading = false;
          this.#cd.detectChanges();
        },
        error: () => {
          this.errorMessage = this.#getTranslation('detail.loadError');
          this.loading = false;
          this.#cd.detectChanges();
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.patient) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.successMessage = null;

    const updatedPatient: Patient = {
      ...this.patient,
      ...this.form.getRawValue(),
      id: this.patient.id,
      name: this.form.value.name ?? this.patient.name,
      description: this.form.value.description ?? this.patient.description,
      averageWeight: Number(this.form.value.averageWeight ?? 0),
      averageHeight: Number(this.form.value.averageHeight ?? 0),
      origin: this.form.value.origin ?? this.patient.origin,
      breed: this.form.value.breed ?? this.patient.name,
      age: Number(this.form.value.age ?? 0),
      ownerName: this.form.value.ownerName ?? '',
      ownerEmail: this.form.value.ownerEmail ?? '',
      ownerPhone: this.form.value.ownerPhone ?? '',
      temperament: this.form.value.temperament ?? '',
      notes: this.form.value.notes ?? '',
      image: this.form.value.image ?? this.patient.image,
    };

    this.#patientsService.updatePatient(updatedPatient);
    this.saving = false;
    this.successMessage = this.#getTranslation('detail.saved');
    this.#cd.detectChanges();
    this.goBack();
  }

  goBack(): void {
    this.#router.navigate(['/patients']);
  }

  #getTranslation(key: string): string {
    const translation = this.#translocoService.translate(key);
    return translation || key;
  }
}
