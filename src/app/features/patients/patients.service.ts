import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, tap } from "rxjs";
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
            tap(datos => {
                const entrada = { data: datos, timestamp: Date.now() };
                localStorage.setItem(this.CACHE_LABEL, JSON.stringify(entrada));
            })
        );
    }
}