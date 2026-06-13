export interface DogApiBreedWeight {
  imperial: string;
  metric: string;
}
export interface DogApiBreedHeight {
  imperial: string;
  metric: string;
}

export interface DogApiBreedImage {
  id?: string;
  width?: number;
  height?: number;
  url?: string;
}

export interface DogApiBreed {
  id: string;
  name: string;
  description?: string;
  temperament?: string;
  bred_for: string | null;
  breed_group?: string | null;
  country_code?: string;
  country_codes?: string | null;
  height?: DogApiBreedHeight;
  weight?: DogApiBreedWeight;
  history?: string | null;
  life_span?: string;
  origin?: string;
  perfect_for?: string | null;
  reference_image_id: string | null;
  species_id?: string;
  image?: DogApiBreedImage;
}

export interface Patient {
  id: number;
  name: string;
  image: string;
  description: string;
  averageWeight: number;
  averageHeight: number;
  origin: string;
}

interface SortCascadeValue {
  prop: keyof Patient;
  order: 'asc' | 'desc';
}

export interface SortCascadeOption {
  name?: string;
  label?: string;
  category?: string;
  icon?: string;
  code?: string;
  value?: SortCascadeValue;
  states?: SortCascadeOption[];
}

export interface PaginatorPageContext {
  active?: boolean;
}

export interface PatientsPaginatorPt {
  root: { class: string };
  page: (options: { context?: PaginatorPageContext }) => { class: string };
  nextbutton: { root: { class: string } };
  prevbutton: { root: { class: string } };
  firstbutton: { root: { class: string } };
  lastbutton: { root: { class: string } };
  current: { class: string };
}
