import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientsService } from './patients.service';
import {
  Patient,
  PatientsPaginatorPt,
  SortCascadeGroup,
  SortCascadeState,
} from './patients.interface';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CascadeSelectModule, CascadeSelectChangeEvent } from 'primeng/cascadeselect';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Subscription } from 'rxjs';
import { Subscription } from 'rxjs';
import { PaginatorModule } from 'primeng/paginator';
import { TranslocoService, TranslocoModule, provideTranslocoScope } from '@jsverse/transloco';
import { TranslocoService, TranslocoModule, provideTranslocoScope } from '@jsverse/transloco';

@Component({
  selector: 'app-patients',
  imports: [FormsModule, ProgressSpinnerModule, MessageModule, CardModule, InputTextModule, IconFieldModule, InputIconModule, CascadeSelectModule, DataViewModule, SelectButtonModule, PaginatorModule, TranslocoModule],
  providers: [PatientsService, provideTranslocoScope('patients')],
  imports: [FormsModule, ProgressSpinnerModule, MessageModule, CardModule, InputTextModule, IconFieldModule, InputIconModule, CascadeSelectModule, DataViewModule, SelectButtonModule, PaginatorModule, TranslocoModule],
  providers: [PatientsService, provideTranslocoScope('patients')],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit, OnDestroy {
export class Patients implements OnInit, OnDestroy {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  loading = false;
  errorMessage: string | null = null;
  sortPlaceholder: string = '';
  sortOptions: any[] = [];
  sortPlaceholder: string = '';
  sortOptions: any[] = [];
  selectedSort: any = null;

  #langSubscription!: Subscription;
  #cd: ChangeDetectorRef;
  #translocoService: TranslocoService;
  #patientsService: PatientsService;

  first = 0;
  rows = 12;
  paginatorPt: PatientsPaginatorPt = {
    root: {
      class:
        '!bg-white/80 !backdrop-blur-md !border !border-neutral/20 !shadow-xl !rounded-full !px-6 !py-1 !flex !items-center !justify-center',
    },
    page: ({ context }: any) => ({
      class: [
        '!rounded-full !min-w-[40px] !h-[40px] !flex !items-center !justify-center !transition-all',
        context?.active
          ? '!bg-neutral !text-white !font-bold'
          : '!text-neutral/70 hover:!bg-neutral/10',
      ].join(' '),
    }),
    nextbutton: { root: { class: '!text-neutral !rounded-full hover:!bg-neutral/10' } },
    prevbutton: { root: { class: '!text-neutral !rounded-full hover:!bg-neutral/10' } },
    firstbutton: { root: { class: '!text-neutral !rounded-full hover:!bg-neutral/10' } },
    lastbutton: { root: { class: '!text-neutral !rounded-full hover:!bg-neutral/10' } },
    current: {
      class: 'text-[10px] font-bold uppercase tracking-tighter text-muted mr-4',
    },
  };

  layout: 'grid' | 'list' = 'grid';
  layoutOptions = [
    { icon: 'pi pi-th-large', value: 'grid' },
    { icon: 'pi pi-bars', value: 'list' },
  ];

  constructor(
    patientsService: PatientsService,
    cd: ChangeDetectorRef,
    translocoService: TranslocoService
  ) {
    this.#patientsService = patientsService;
    this.#cd = cd;
    this.#translocoService = translocoService;
  }
  patientsService: PatientsService,
  cd: ChangeDetectorRef,
  translocoService: TranslocoService
  ) {
  this.#patientsService = patientsService;
  this.#cd = cd;
  this.#translocoService = translocoService;
}

ngOnInit(): void {
  this.loadData()
    this.#langSubscription = this.#translocoService.selectTranslation('patients').subscribe(translations => {
    if (translations) {
      this.#initializeSortOptions(translations);
    }
  });
};

#translate(key: string): string {
  return this.#translocoService.translate(key);
}

#initializeSortOptions(translations: any): void {

  /*console.log(translations);
  if (!translations || !translations['sort.name']) {
    console.log(translations);
    console.error('No se encontraron traducciones para pacientes');
    return;
  }*/

  this.sortPlaceholder = translations.placeholderSort;

  this.sortOptions = [
    {
      name: translations['sort.name'],
      code: 'name',
      states: [
        { label: translations['sort.ascendant'], category: translations['sort.name'], icon: 'pi pi-sort-alpha-down', value: { prop: 'name', order: 'asc' } },
        { label: translations['sort.descendant'], category: translations['sort.name'], icon: 'pi pi-sort-alpha-up', value: { prop: 'name', order: 'desc' } }
      ]
    },
    {
      name: translations['sort.origin'],
      code: 'origin',
      states: [
        { label: translations['sort.ascendant'], category: translations['sort.origin'], icon: 'pi pi-sort-alpha-down', value: { prop: 'origin', order: 'asc' } },
        { label: translations['sort.descendant'], category: translations['sort.origin'], icon: 'pi pi-sort-alpha-up', value: { prop: 'origin', order: 'desc' } }
      ]
    },
    {
      name: translations['sort.averageWeight'],
      code: 'averageWeight',
      states: [
        { label: translations['sort.lessToMore'], category: translations['sort.averageWeight'], icon: 'pi pi-sort-numeric-down', value: { prop: 'averageWeight', order: 'asc' } },
        { label: translations['sort.moreToLess'], category: translations['sort.averageWeight'], icon: 'pi pi-sort-numeric-up', value: { prop: 'averageWeight', order: 'desc' } }
      ]
    },
    {
      name: translations['sort.averageHeight'],
      code: 'averageHeight',
      states: [
        { label: translations['sort.lessToMore'], category: translations['sort.averageHeight'], icon: 'pi pi-sort-numeric-down', value: { prop: 'averageHeight', order: 'asc' } },
        { label: translations['sort.moreToLess'], category: translations['sort.averageHeight'], icon: 'pi pi-sort-numeric-up', value: { prop: 'averageHeight', order: 'desc' } }
      ]
    }
  ];

  this.#cd.detectChanges();
}
this.#langSubscription = this.#translocoService.selectTranslation('patients').subscribe(translations => {
  if (translations) {
    this.#initializeSortOptions(translations);
  }
});
  };

#translate(key: string): string {
  return this.#translocoService.translate(key);
}

#initializeSortOptions(translations: any): void {

  /*console.log(translations);
  if (!translations || !translations['sort.name']) {
    console.log(translations);
    console.error('No se encontraron traducciones para pacientes');
    return;
  }*/

  this.sortPlaceholder = translations.placeholderSort;

  this.sortOptions = [
    {
      name: translations['sort.name'],
      code: 'name',
      states: [
        { label: translations['sort.ascendant'], category: translations['sort.name'], icon: 'pi pi-sort-alpha-down', value: { prop: 'name', order: 'asc' } },
        { label: translations['sort.descendant'], category: translations['sort.name'], icon: 'pi pi-sort-alpha-up', value: { prop: 'name', order: 'desc' } }
      ]
    },
    {
      name: translations['sort.origin'],
      code: 'origin',
      states: [
        { label: translations['sort.ascendant'], category: translations['sort.origin'], icon: 'pi pi-sort-alpha-down', value: { prop: 'origin', order: 'asc' } },
        { label: translations['sort.descendant'], category: translations['sort.origin'], icon: 'pi pi-sort-alpha-up', value: { prop: 'origin', order: 'desc' } }
      ]
    },
    {
      name: translations['sort.averageWeight'],
      code: 'averageWeight',
      states: [
        { label: translations['sort.lessToMore'], category: translations['sort.averageWeight'], icon: 'pi pi-sort-numeric-down', value: { prop: 'averageWeight', order: 'asc' } },
        { label: translations['sort.moreToLess'], category: translations['sort.averageWeight'], icon: 'pi pi-sort-numeric-up', value: { prop: 'averageWeight', order: 'desc' } }
      ]
    },
    {
      name: translations['sort.averageHeight'],
      code: 'averageHeight',
      states: [
        { label: translations['sort.lessToMore'], category: translations['sort.averageHeight'], icon: 'pi pi-sort-numeric-down', value: { prop: 'averageHeight', order: 'asc' } },
        { label: translations['sort.moreToLess'], category: translations['sort.averageHeight'], icon: 'pi pi-sort-numeric-up', value: { prop: 'averageHeight', order: 'desc' } }
      ]
    }
  ];

  this.#cd.detectChanges();
}

  get paginatedPatients() {
  return this.filteredPatients.slice(this.first, this.first + this.rows);
}

loadData() {
  this.loading = true;
  this.errorMessage = null;

  this.#patientsService.getPatients().subscribe({
    this.#patientsService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = [...data];
        this.loading = false;
        this.#cd.detectChanges();
        this.#cd.detectChanges();
      },
      error: (error) => {
        console.error('Error capturado:', error);

        this.errorMessage =
          'Lo sentimos, no pudimos sincronizar los datos con Vet-Link. Por favor, intenta de nuevo más tarde.';

        this.loading = false;

        this.#cd.markForCheck();
        this.#cd.detectChanges();
        this.#cd.markForCheck();
        this.#cd.detectChanges();
      }
    });
  }

  filterPatients(event: Event): void {
    const searchInput = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredPatients = this.patients.filter(
      (p) =>
        p.name.toLowerCase().includes(searchInput) ||
        p.description.toLowerCase().includes(searchInput) ||
        p.origin.toLowerCase().includes(searchInput) ||
        p.averageWeight.toString().includes(searchInput) ||
        p.averageHeight.toString().includes(searchInput)
    );

    this.first = 0;
  }

  onPageChange(event: { first: number; rows: number }) {
    this.first = event.first;
    this.rows = event.rows;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  sortPatients(event: CascadeSelectChangeEvent) {
    const selection = event.value;

    if(!selection || !selection.value) {
    this.selectedSort = null;
    this.filteredPatients = [...this.patients];
    this.#cd.detectChanges();
    this.#cd.detectChanges();
    return;
  }

  const { prop, order } = selection.value;

  this.filteredPatients = [...this.filteredPatients].sort((a, b) => {
    const valueA = a[prop as keyof Patient];
    const valueB = b[prop as keyof Patient];

    let result = 0;

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      result = valueA.localeCompare(valueB);
    } else if (typeof valueA === 'number' && typeof valueB === 'number') {
      result = valueA - valueB;
    }

    return order === 'asc' ? result : -result;
  });

  this.#cd.markForCheck();
  this.#cd.detectChanges();
}

ngOnDestroy(): void {
  if(this.#langSubscription) {
  this.#langSubscription.unsubscribe();
}
this.#cd.markForCheck();
this.#cd.detectChanges();
  }

ngOnDestroy(): void {
  if(this.#langSubscription) {
  this.#langSubscription.unsubscribe();
}
  }
}
