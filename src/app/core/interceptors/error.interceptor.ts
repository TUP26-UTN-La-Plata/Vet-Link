import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: string | string[];
  timestamp: string;
  path: string;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error && typeof error.error === 'object') {
        const apiError = error.error as ApiErrorPayload;

        switch (apiError.code) {
          // 1. autenticatión / session expired
          case 'AUTH_TOKEN_MISSING':
          case 'AUTH_TOKEN_INVALID':
          case 'AUTH_TOKEN_EXPIRED':
            router.navigate(['/login']);
            break;

          // 2. role not allowed
          case 'FORBIDDEN_ROLE':
            alert(typeof apiError.details === 'string' ? apiError.details : apiError.message);
            break;

          // 3. Input validation errors
          case 'VALIDATION_ERROR':
            console.warn('Input validation errors:', apiError.details);
            break;

          // 4. Other business or service errors from NestJS catalog
          case 'PATIENT_NOT_FOUND':
          case 'PATIENT_ALREADY_EXISTS':
          case 'OWNER_NOT_FOUND':
          case 'OWNER_ALREADY_EXISTS':
          case 'DOG_API_ERROR':
          case 'RANDOM_USER_ERROR':
          case 'SEED_NOT_READY':
          case 'ROUTE_NOT_FOUND':
          case 'INTERNAL_SERVER_ERROR':
          default:
            alert(apiError.message);
            break;
        }
      }

      return throwError(() => error);
    })
  );
};
