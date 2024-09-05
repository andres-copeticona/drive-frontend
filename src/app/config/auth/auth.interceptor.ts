import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@app/shared/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authSerivce: AuthService = inject(AuthService);

  const token = authSerivce.getInfo()?.token;

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
