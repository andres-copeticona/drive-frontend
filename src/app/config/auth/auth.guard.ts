import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '@app/shared/services/auth.service';

export const authGuard: CanActivateFn | CanMatchFn = () => {
  const router: Router = inject(Router);
  const authService = inject(AuthService);

  if (authService.getInfo()?.token) {
    return true;
  } else {
    return router.createUrlTree(['/login']);
  }
};
