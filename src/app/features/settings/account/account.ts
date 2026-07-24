import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '@core/services/auth.service';
import { ProfileStateService } from '@core/services/profile-state.service';
import { ActionButton } from '@shared/ui/action-button/action-button';
import { provideTranslocoScope, TranslocoModule } from '@jsverse/transloco';
import { UserProfile } from './account.interface';

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
  protected form = this.#fb.group({
    phones: this.#fb.array([this.#createPhoneControl('')]),
    address: this.#fb.control('', { nonNullable: true }),
    birthDate: this.#fb.control('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.#profileStateService.loadProfile();
    const profile = this.#profileStateService.getCurrentProfile();

    this.form.setControl(
      'phones',
      this.#fb.array(
        profile.phones.length
          ? profile.phones.map((phone) => this.#createPhoneControl(phone))
          : [this.#createPhoneControl('')]
      )
    );
    this.form.patchValue({
      address: profile.address,
      birthDate: profile.birthDate,
    });
  }

  protected get phones(): FormArray<FormControl<string>> {
    return this.form.controls.phones;
  }

  protected addPhone(): void {
    this.phones.push(this.#createPhoneControl(''));
  }

  protected removePhone(index: number): void {
    if (this.phones.length <= 1) {
      this.phones.at(0).setValue('');
      return;
    }

    this.phones.removeAt(index);
  }

  protected onSubmit(): void {
    const profile: UserProfile = {
      phones: this.phones.controls.map((control) => control.value.trim()),
      address: this.form.controls.address.value.trim(),
      birthDate: this.form.controls.birthDate.value,
    };

    this.#profileStateService.updateProfile(profile);
    this.#router.navigate(['/settings']);
  }

  protected onCancel(): void {
    this.#router.navigate(['/settings']);
  }

  #createPhoneControl(value: string): FormControl<string> {
    return this.#fb.control(value, { nonNullable: true });
  }
}
