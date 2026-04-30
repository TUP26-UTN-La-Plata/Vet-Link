import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, of, tap } from "rxjs";
import { Patient } from "./patients.interface";

@Injectable({
    providedIn: 'root'
})
export class PatientsService {
    private readonly API_URL = 'https://api.thedogapi.com/v1/breeds';
    private readonly API_KEY = 'live_ePinWLFEmQECQTjlVDJ8yZQ6f3j8c92HdxPwQKwMKgO6cEdnoETYF2Q2ojviwcUa';
    private readonly CACHE_LABEL = 'patients_cache';
    private readonly CACHE_LIFETIME = 5 * 60 * 1000;

    constructor(private http: HttpClient) {
        console.log('Patients Service initialized');
    }

    getPatients(): Observable<Patient[]> {
        const cache: string | null = localStorage.getItem(this.CACHE_LABEL);

        if (cache) {
            const { data, timestamp } = JSON.parse(cache);
            const isValid = (Date.now() - timestamp) < this.CACHE_LIFETIME
            if (isValid) {
                console.log('Using data from cache');
                return of(data);
            }
        }

        console.log('Cache expired or not found. Fetching from API...');

        return this.http.get<Patient[]>(this.API_URL).pipe(
            map((apiData: any[]) => {
                return apiData.map(item => this.itemToPatient(item));
            }),
            tap(mappedData => {
                const formattedData = { data: mappedData, timestamp: Date.now() };
                localStorage.setItem(this.CACHE_LABEL, JSON.stringify(formattedData));
            })
        );
    }

    private itemToPatient(item: any): Patient {
        return {
            id: item.id,
            name: item.name,
            image: item.image.url || 'assets/no-image.png',
            description: item.temperament || item.bred_for || 'Sin descripción',
            averageWeight: this.averageExtraction(item.weight?.metric),
            averageHeight: this.averageExtraction(item.height?.metric),
            origin: item.origin || 'Desconocido',
        };
    }

    private averageExtraction(range: string): number {
        if (!range) return 0;
        const parts = range.split('-').map(val => parseFloat(val.trim()));

        let result = 0;

        if (parts.length === 2) {
            result = (parts[0] + parts[1]) / 2;
        } else {
            result = parts[0] || 0;
        }
        return Number(result.toFixed(0));
    }
}