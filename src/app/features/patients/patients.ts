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
import { CascadeSelectModule, CascadeSelectChangeEvent } from 'primeng/cascadeselect';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { delay } from 'rxjs';

@Component({
  selector: 'app-patients',
  imports: [FormsModule, ProgressSpinnerModule, MessageModule, CardModule, InputTextModule, IconFieldModule, InputIconModule, CascadeSelectModule, DataViewModule, SelectButtonModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  sortOptions: any[] = [
    {
      name: 'Nombre',
      code: 'name',
      states: [
        { label: 'A-Z', category: 'Nombre', icon: 'pi pi-sort-alpha-down', value: { prop: 'name', order: 'asc' } },
        { label: 'Z-A', category: 'Nombre', icon: 'pi pi-sort-alpha-up', value: { prop: 'name', order: 'desc' } }
      ]
    },
    {
      name: 'Origen',
      code: 'origin',
      states: [
        { label: 'A-Z', category: 'Origen', icon: 'pi pi-sort-alpha-down', value: { prop: 'origin', order: 'asc' } },
        { label: 'Z-A', category: 'Origen', icon: 'pi pi-sort-alpha-up', value: { prop: 'origin', order: 'desc' } }
      ]
    },
    {
      name: 'Peso',
      code: 'weight',
      states: [
        { label: 'Menor a Mayor', category: 'Peso', icon: 'pi pi-sort-numeric-down', value: { prop: 'averageWeight', order: 'asc' } },
        { label: 'Mayor a Menor', category: 'Peso', icon: 'pi pi-sort-numeric-up', value: { prop: 'averageWeight', order: 'desc' } }
      ]
    },
    {
      name: 'Altura',
      code: 'height',
      states: [
        { label: 'Menor a Mayor', category: 'Altura', icon: 'pi pi-sort-numeric-down', value: { prop: 'averageHeight', order: 'asc' } },
        { label: 'Mayor a Menor', category: 'Altura', icon: 'pi pi-sort-numeric-up', value: { prop: 'averageHeight', order: 'desc' } }
      ]
    }
  ];
  selectedSort: any = null;

  layout: 'grid' | 'list' = 'grid';
  layoutOptions = [
    { icon: 'pi pi-th-large', value: 'grid' },
    { icon: 'pi pi-bars', value: 'list' }
  ];

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

  sortPatients(event: CascadeSelectChangeEvent) {
    const selection = event.value;

    if (!selection || !selection.value) {
      this.selectedSort = null;
      this.filteredPatients = [...this.patients];
      return;
    }

    const { prop, order } = selection.value;

    this.filteredPatients.sort((a, b) => {
      const valueA = a[prop as keyof Patient];
      const valueB = b[prop as keyof Patient];

      if (order === 'asc') {
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return valueA.localeCompare(valueB);
        }
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return valueA - valueB;
        }
      }

      else if (order === 'desc') {
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return valueB.localeCompare(valueA);
        }
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return valueB - valueA;
        }
      }

      return 0;
    });
  }
}
