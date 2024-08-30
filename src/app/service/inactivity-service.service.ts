// import { Inject, Injectable } from '@angular/core';
// import { Router, NavigationEnd } from '@angular/router';
// import { AuthServiceService } from './auth-service.service';
// import { isPlatformBrowser } from '@angular/common';
// import { PLATFORM_ID } from '@angular/core';
// import { filter } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
// export class InactivityService {
//   private timeoutId: any;
//   private initialTimeoutDuration = 1 * 1000; // 1 segundo
//   private finalTimeoutDuration = 3 * 60 * 1000; // 3 minutos
//   private excludedRoutes = ['/detalleSello', '/file', '/folder'];
//   private currentRoute: string = '';

//   constructor(
//     private authService: AuthServiceService,
//     private router: Router,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {
//     if (isPlatformBrowser(this.platformId)) {
//       this.updateCurrentRoute();

//       // Escucha cambios de ruta para actualizar la ruta actual
//       this.router.events.pipe(
//         filter(event => event instanceof NavigationEnd)
//       ).subscribe(() => {
//         this.updateCurrentRoute();
//       });

//       this.startInactivityTimer(this.initialTimeoutDuration);
//       console.log('Inactivity timer started desde el constructor');
//     }
//   }

//   private updateCurrentRoute(): void {
//     this.currentRoute = this.router.url;
//     console.log('Current route updated:', this.currentRoute);
//   }

//   startInactivityTimer(duration: number): void {
//     if (isPlatformBrowser(this.platformId)) {
//       this.resetInactivityTimer(duration);

//       ['click', 'mousemove', 'keydown'].forEach(event => {
//         window.addEventListener(event, () => this.resetInactivityTimer(this.finalTimeoutDuration));
//       });
//     }
//   }

//   resetInactivityTimer(duration: number): void {
//     if (this.timeoutId) {
//       clearTimeout(this.timeoutId);
//     }

//     this.timeoutId = setTimeout(() => {
//       this.handleInactivity();
//     }, duration);
//   }

//   handleInactivity(): void {
//     if (this.excludedRoutes.includes(this.currentRoute)) {
//       console.log('Ruta excluida, no se cerrará la sesión.');
//     } else {
//       this.logout();
//     }
//   }

//   logout(): void {
//     localStorage.removeItem('token');
//     console.log('Sesión cerrada por inactividad');
//     this.authService.cerrarSesion();
//     this.router.navigate(['/']);
//   }
// }
