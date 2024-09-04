import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthServiceService } from '../../service/auth-service.service';

export const authGuard: CanActivateFn | CanMatchFn = () => {
  const router: Router = inject(Router);
  const authService: AuthServiceService = inject(AuthServiceService);

  console.log('authGuard');

  if (authService.obtenerIdUsuario()) {
    return true;
  } else {
    return router.createUrlTree(['/login']);
  }
};
