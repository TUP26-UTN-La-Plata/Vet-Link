import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { OwnersStateService } from './owners-state.service';
import { Owner } from './owners.interface';

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
  ],
  templateUrl: './owners.html',
  styleUrl: './owners.css',
})
export class OwnersComponent implements OnInit {
  readonly ownersState = inject(OwnersStateService);

  readonly owners = this.ownersState.owners;
  readonly filteredOwners = this.ownersState.filteredOwners;
  readonly loading = this.ownersState.loading;
  readonly errorMessage = this.ownersState.errorMessage;

  ngOnInit(): void {
    this.ownersState.loadOwners();
  }

  filterOwners(event: Event): void {
    const searchText = (event.target as HTMLInputElement).value;
    this.ownersState.setSearchTerm(searchText);
  }

  trackByOwner(_: number, owner: Owner): string {
    return owner.id;
  }
}
