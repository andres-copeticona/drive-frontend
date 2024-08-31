import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../../service/auth-service.service';

export const authGuard: CanActivateFn = () => {
  const router: Router = inject(Router);
  const authService: AuthServiceService = inject(AuthServiceService);

  console.log('authGuard');

  if (authService.obtenerIdUsuario()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
