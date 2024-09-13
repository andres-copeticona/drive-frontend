import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@app/shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authSerivce: AuthService = inject(AuthService);
  const ts = inject(ToastrService);

  const token = authSerivce.getInfo()?.token;
  const expiration = authSerivce.getInfo()?.tokenExpiration;

  if (expiration && new Date(expiration) < new Date()) {
    authSerivce.logout();
    ts.error('Por favor inicie sesión nuevamente', 'Sesión expirada');
    return next(req);
  }

  let authReq = req;

  if (token)
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        authSerivce.logout();
        ts.error('Por favor inicie sesión nuevamente', 'Sesión expirada');
      }
      return throwError(() => err);
    }),
  );
};
