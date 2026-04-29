import { Component, OnInit } from '@angular/core';
import { PatientsService } from './patients.service';
import { Patient } from './patients.interface';

@Component({
  selector: 'app-patients',
  imports: [],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  loading: boolean = false;
  errorMsj: string | null = null;

  constructor(private patientsService: PatientsService) { }

  ngOnInit(): void {
    this.loadData()
  };

  loadData() {
    this.loading = true;
    this.errorMsj = null;

    this.patientsService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error capturado:', error);
        this.errorMsj = 'Error al cargar los pacientes';
        this.loading = false;
      }
    });
  }

  filterPatients(event: Event): void {
    const searchInput = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredPatients = this.patients.filter(p => p.name.toLowerCase().includes(searchInput));
  }
}
