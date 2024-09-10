import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@app/shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authSerivce: AuthService = inject(AuthService);

  const token = authSerivce.getInfo()?.token;
  const expiration = authSerivce.getInfo()?.tokenExpiration;

  if (expiration && new Date(expiration) < new Date()) {
    const ts = inject(ToastrService);
    authSerivce.logout();
    ts.error('Por favor inicie sesión nuevamente', 'Sesión expirada');
    return next(req);
  }

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  } else {
    return next(req);
  }
};
