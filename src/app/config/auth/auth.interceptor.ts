import { HttpInterceptorFn } from '@angular/common/http';
import { AuthServiceService } from '../../service/auth-service.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('AuthInterceptor');
  const authSerivce: AuthServiceService = inject(AuthServiceService);

  const token = authSerivce.obtenerToken();

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
