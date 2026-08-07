import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '@core/services/auth.service';
import { ProfileStateService } from '@core/services/profile-state.service';
import { ActionButton } from '@shared/ui/action-button/action-button';
import { provideTranslocoScope, TranslocoModule } from '@jsverse/transloco';
import { UserProfile } from './account.interface';

export function maxDateValidator(maxDateStr: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    return control.value > maxDateStr ? { futureDate: true } : null;
  };
}

@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule, TranslocoModule, InputTextModule, ActionButton],
  providers: [provideTranslocoScope('settings')],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {
  readonly #router = inject(Router);
  readonly #fb = inject(FormBuilder);
  readonly #authService = inject(AuthService);
  readonly #profileStateService = inject(ProfileStateService);

  protected readonly userData = this.#authService.userData;

  protected readonly maxDate = new Date().toISOString().split('T')[0];

  protected form = this.#fb.group({
    phones: this.#fb.array([this.#createPhoneControl('', true)]),
    address: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(128)],
    }),
    birthDate: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required, maxDateValidator(this.maxDate)],
    }),
  });

  ngOnInit(): void {
    this.#profileStateService.getProfileFromApi().subscribe({
      next: (profile) => {
        this.form.setControl(
          'phones',
          this.#fb.array(
            profile.phones && profile.phones.length
              ? profile.phones.map((phone, index) => this.#createPhoneControl(phone, index === 0))
              : [this.#createPhoneControl('', true)]
          )
        );
        this.form.patchValue({
          address: profile.address || '',
          birthDate: profile.birthDate || '',
        });
      },
    });
  }

  protected get phones(): FormArray<FormControl<string>> {
    return this.form.controls.phones;
  }

  protected addPhone(): void {
    this.phones.push(this.#createPhoneControl('', false));
  }

  protected removePhone(index: number): void {
    if (this.phones.length <= 1) {
      this.phones.at(0).setValue('');
      return;
    }

    this.phones.removeAt(index);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const profile: UserProfile = {
      phones: this.phones.controls
        .map((control) => control.value.trim())
        .filter((phone) => phone.length > 0),
      address: this.form.controls.address.value.trim(),
      birthDate: this.form.controls.birthDate.value,
    };

    this.#profileStateService.updateProfile(profile).subscribe({
      next: () => {
        this.#router.navigate(['/settings']);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
      },
    });
  }

  protected onCancel(): void {
    this.#router.navigate(['/settings']);
  }

  #createPhoneControl(value: string, isRequired = false): FormControl<string> {
    const validators = [
      Validators.minLength(2),
      Validators.maxLength(15),
      Validators.pattern(/^[0-9]*$/),
    ];

    if (isRequired) {
      validators.push(Validators.required);
    }

    return this.#fb.control(value, {
      nonNullable: true,
      validators,
    });
  }
}
