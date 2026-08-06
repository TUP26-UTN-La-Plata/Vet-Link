import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, from } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { MessageService } from 'primeng/api';

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: string | string[];
  timestamp: string;
  path: string;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error && typeof error.error === 'object') {
        const apiError = error.error as ApiErrorPayload;

        switch (apiError.code) {
          // 1. authentication / session expired
          case 'AUTH_TOKEN_MISSING':
          case 'AUTH_TOKEN_INVALID':
            router.navigate(['/login']);
            break;
          case 'AUTH_TOKEN_EXPIRED': {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
              return from(user.getIdToken(true)).pipe(
                switchMap((newToken) => {
                  const clonedReq = req.clone({
                    setHeaders: { Authorization: `Bearer ${newToken}` },
                  });
                  return next(clonedReq);
                }),
                catchError((renewErr) => {
                  router.navigate(['/login']);
                  return throwError(() => renewErr);
                })
              );
            }
            router.navigate(['/login']);
            break;
          }

          // 2. role not allowed
          case 'FORBIDDEN_ROLE':
            messageService.add({
              severity: 'error',
              summary: 'Access denied',
              detail: typeof apiError.details === 'string' ? apiError.details : apiError.message,
              life: 5000,
            });
            break;

          // 3. Input validation errors
          case 'VALIDATION_ERROR':
            console.warn('Errores de validación:', apiError.details);
            messageService.add({
              severity: 'warn',
              summary: 'Invalid data',
              detail: Array.isArray(apiError.details)
                ? apiError.details.join(', ')
                : apiError.message,
              life: 5000,
            });
            break;

          // 4. Other business or service errors from NestJS catalog
          default:
            messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: apiError.message || 'Unknown error',
              life: 5000,
            });
            break;
        }
      } else {
        // 5. Fallback for generic HTTP errors
        messageService.add({
          severity: 'error',
          summary: 'Communication error',
          detail: 'Could not establish connection with the Vet-Link server.',
          life: 5000,
        });
      }

      return throwError(() => error);
    })
  );
};
