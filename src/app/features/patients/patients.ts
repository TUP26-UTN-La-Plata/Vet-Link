import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientsService } from './patients.service';
import { Patient } from './patients.interface';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { SelectModule, SelectChangeEvent } from 'primeng/select';
import { delay } from 'rxjs';

@Component({
  selector: 'app-patients',
  imports: [FormsModule, ProgressSpinnerModule, MessageModule, CardModule, InputTextModule, IconFieldModule, InputIconModule, SelectModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  sortOptions = [
    { label: 'Nombre (A-Z) (Por defecto)', value: 'name' },
    { label: 'Origen', value: 'origin' },
    { label: 'Peso (Menor a Mayor)', value: 'averageWeight' },
    { label: 'Altura (Menor a Mayor)', value: 'averageHeight' }
  ];

  // Variable para el valor seleccionado en el p-select
  selectedSort: string | null = null;

  constructor(
    private patientsService: PatientsService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadData()
  };

  loadData() {
    this.loading = true;
    this.errorMessage = null;

    this.patientsService.getPatients().pipe(delay(2000)).subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = [...data];
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Error capturado:', error);
        this.errorMessage = 'Error al cargar los pacientes';
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  filterPatients(event: Event): void {
    const searchInput = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredPatients = this.patients.filter(p =>
      p.name.toLowerCase().includes(searchInput) ||
      p.description.toLowerCase().includes(searchInput) ||
      p.origin.toLowerCase().includes(searchInput) ||
      p.averageWeight.toString().includes(searchInput) ||
      p.averageHeight.toString().includes(searchInput)
    );
  }

  sortPatients(event: SelectChangeEvent) {
    const property = event.value as keyof Patient;
    if (!property) return;

    this.filteredPatients.sort((a, b) => {
      const valueA = a[property];
      const valueB = b[property];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB);
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return valueA - valueB;
      }

      return 0;
    });
  }
}
