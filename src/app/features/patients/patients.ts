import { Component, ChangeDetectorRef, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Patient, PatientsPaginatorPt, SortCascadeOption } from './patients.interface';
import { PatientsService } from './patients.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CascadeSelectModule, CascadeSelectChangeEvent } from 'primeng/cascadeselect';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TranslocoService, TranslocoModule, provideTranslocoScope } from '@jsverse/transloco';
import { AnalyticsService } from '@core/services/analytics.service';

@Component({
  selector: 'app-patients',
  imports: [
    FormsModule,
    ProgressSpinnerModule,
    MessageModule,
    CardModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    CascadeSelectModule,
    DataViewModule,
    SelectButtonModule,
    PaginatorModule,
    TranslocoModule,
  ],
  providers: [PatientsService, provideTranslocoScope('patients')],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  loading = false;
  errorMessage: string | null = null;
  sortPlaceholder = '';
  selectedSort: SortCascadeOption | null = null;
  sortOptions: SortCascadeOption[] = [];

  first = 0;
  rows = 12;
  paginatorPt: PatientsPaginatorPt = {
    root: {
      class:
        '!bg-white/80 !backdrop-blur-md !border !border-neutral/20 !shadow-xl !rounded-full !px-6 !py-1 !flex !items-center !justify-center',
    },
    page: (options: { context?: { active?: boolean } }) => ({
      class: [
        '!rounded-full !min-w-[40px] !h-[40px] !flex !items-center !justify-center !transition-all',
        options.context?.active
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

  readonly #patientsService = inject(PatientsService);
  readonly #cd = inject(ChangeDetectorRef);
  readonly #destroyRef = inject(DestroyRef);
  readonly #translocoService = inject(TranslocoService);
  readonly #analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.loadData();

    this.#translocoService
      .selectTranslation('patients')
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((translations) => {
        if (translations) {
          this.sortPlaceholder = translations['placeholderSort'] || '';
          this.#initializeSortOptions(translations);
        }
      });
  }

  onLayoutChange(newLayout: 'grid' | 'list'): void {
    this.layout = newLayout;

    this.#analyticsService.trackEvent('layout_change', {
      layout: newLayout,
    });
  }

  #initializeSortOptions(t: Record<string, unknown>): void {
    const sort = t['sort'] as Record<string, string> | undefined;

    this.sortOptions = [
      {
        name: sort?.['name'] || 'Nombre',
        code: 'name',
        states: [
          {
            label: sort?.['ascendant'] || 'Ascendente',
            category: sort?.['name'] || 'Nombre',
            icon: 'pi pi-sort-alpha-down',
            value: { prop: 'name', order: 'asc' },
          },
          {
            label: sort?.['descendant'] || 'Descendente',
            category: sort?.['name'] || 'Nombre',
            icon: 'pi pi-sort-alpha-up',
            value: { prop: 'name', order: 'desc' },
          },
        ],
      },
      {
        name: sort?.['origin'] || 'Origen',
        code: 'origin',
        states: [
          {
            label: sort?.['ascendant'] || 'Ascendente',
            category: sort?.['origin'] || 'Origen',
            icon: 'pi pi-sort-alpha-down',
            value: { prop: 'origin', order: 'asc' },
          },
          {
            label: sort?.['descendant'] || 'Descendente',
            category: sort?.['origin'] || 'Origen',
            icon: 'pi pi-sort-alpha-up',
            value: { prop: 'origin', order: 'desc' },
          },
        ],
      },
      {
        name: sort?.['averageWeight'] || 'Peso Promedio',
        code: 'averageWeight',
        states: [
          {
            label: sort?.['lessToMore'] || 'Menos a Más',
            category: sort?.['averageWeight'] || 'Peso Promedio',
            icon: 'pi pi-sort-numeric-down',
            value: { prop: 'averageWeight', order: 'asc' },
          },
          {
            label: sort?.['moreToLess'] || 'Más a Menos',
            category: sort?.['averageWeight'] || 'Peso Promedio',
            icon: 'pi pi-sort-numeric-up',
            value: { prop: 'averageWeight', order: 'desc' },
          },
        ],
      },
      {
        name: sort?.['averageHeight'] || 'Altura Promedio',
        code: 'averageHeight',
        states: [
          {
            label: sort?.['lessToMore'] || 'Menos a Más',
            category: sort?.['averageHeight'] || 'Altura Promedio',
            icon: 'pi pi-sort-numeric-down',
            value: { prop: 'averageHeight', order: 'asc' },
          },
          {
            label: sort?.['moreToLess'] || 'Más a Menos',
            category: sort?.['averageHeight'] || 'Altura Promedio',
            icon: 'pi pi-sort-numeric-up',
            value: { prop: 'averageHeight', order: 'desc' },
          },
        ],
      },
    ];

    this.#cd.detectChanges();
  }

  get paginatedPatients() {
    return this.filteredPatients.slice(this.first, this.first + this.rows);
  }

  loadData() {
    this.loading = true;
    this.errorMessage = null;

    this.#patientsService
      .getPatients()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (data) => {
          this.patients = data;
          this.filteredPatients = [...data];
          this.loading = false;
          this.#cd.detectChanges();
        },
        error: (error) => {
          console.error('Error capturado:', error);

          this.errorMessage =
            'Lo sentimos, no pudimos sincronizar los datos con Vet-Link. Por favor, intenta de nuevo más tarde.';

          this.loading = false;

          this.#cd.markForCheck();
          this.#cd.detectChanges();
        },
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

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 12;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  sortPatients(event: CascadeSelectChangeEvent) {
    const selection = event.value as SortCascadeOption | null;

    if (!selection || !selection.value) {
      this.selectedSort = null;
      this.filteredPatients = [...this.patients];
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
}
