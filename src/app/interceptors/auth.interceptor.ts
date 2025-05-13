import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import Swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.warn('Intercepted error on:', req.url);
        console.warn('Error message:', error?.error?.message);

        const excludedUrls = [
          '/auth/login',
          '/auth/register',
          '/auth/check-token'
        ];
        const isExcluded = excludedUrls.some((excludedUrl) =>
          req.url.includes(excludedUrl)
        );

        if (isExcluded) {
          return throwError(() => error);
        }

        const token = localStorage.getItem('token');

        if (
          error.status === 401 &&
          error.error?.message === 'Token Expired' &&
          token
        ) {
          this.authService.logOutUser();
          this.router.navigate(['/login']);

          Swal.fire({
            position: "center",
            icon: "error",
            title: "Tu sesión ha expirado",
            showConfirmButton: false,
            timer: 1500
          });

        }

        return throwError(() => error);
      })
    );
  }

}
