import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Owner } from './owners.interface';
import { TranslocoModule, provideTranslocoScope } from '@jsverse/transloco';
import { PatientsStateService } from '../../core/services/items-state.service';
import { AsyncPipe } from '@angular/common';

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
  ],
  providers: [provideTranslocoScope('owners')],
  templateUrl: './owners.html',
  styleUrl: './owners.css',
})
export class OwnersComponent implements OnInit {
  readonly ownersState = inject(PatientsStateService);

  readonly owners$ = this.ownersState.owners$;
  readonly filteredOwners$ = this.ownersState.filteredOwners$;
  readonly loading$ = this.ownersState.loading$;
  readonly errorMessage$ = this.ownersState.errorMessage$;

  ngOnInit(): void {
    this.ownersState.getOwners().subscribe();
  }

  filterOwners(event: Event): void {
    const searchText = (event.target as HTMLInputElement).value;
    this.ownersState.setOwnerSearchTerm(searchText);
  }

  trackByOwner(_: number, owner: Owner): string {
    return owner.id;
  }
}
