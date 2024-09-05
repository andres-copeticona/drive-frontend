import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { BaseService } from '@shared/services/base.service';
import { Router } from '@angular/router';
import { addMinutes } from 'date-fns';
import { isPlatformServer } from '@angular/common';

interface IAuthInfo {
  userId: number;
  token: string;
  roleId: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  private authInfoKey = 'authInfo';

  private router: Router = inject(Router);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    super('auth');
  }

  login(username: string, password: string): Promise<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      login: username,
      password: password,
      token: 'servidoresgadc12345',
    };
    return firstValueFrom(
      this.http.post(`${this.namespace}/login`, body, { headers }),
    );
  }

  saveInfo(authInfo: IAuthInfo): void {
    localStorage.setItem(this.authInfoKey, JSON.stringify(authInfo));

    this.setCookie(authInfo);
  }

  removeInfo(): void {
    localStorage.removeItem(this.authInfoKey);
    this.deleteCookie();
  }

  getInfo(): IAuthInfo | null {
    if (isPlatformServer(this.platformId)) {
      console.log('Server side');
      return null;
    }

    const authInfo = localStorage.getItem(this.authInfoKey);

    return authInfo ? JSON.parse(authInfo) : null;
  }

  logout() {
    if (typeof window === 'undefined') return;
    this.removeInfo();
    this.router.navigate(['/']);
  }

  cerrarSesion(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('expirationTime');
    }
  }

  verificarExpiracionToken(): boolean {
    const expiration = localStorage.getItem('expirationTime');
    if (expiration) {
      const now = new Date().getTime();
      return now > parseInt(expiration, 10);
    }
    return true;
  }

  private setCookie(authInfo: IAuthInfo) {
    let cookieStr =
      encodeURIComponent('CrCookie') +
      '=' +
      encodeURIComponent(JSON.stringify(authInfo));

    const dtExpires = addMinutes(new Date(), 5);

    cookieStr += ';expires=' + dtExpires.toUTCString();
    cookieStr += ';path=/';
    cookieStr += ';samesite=lax';

    document.cookie = cookieStr;
  }

  private deleteCookie() {
    document.cookie =
      encodeURIComponent('CrCookie') +
      '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  }
}
