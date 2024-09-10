import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { BaseService } from '@shared/services/base.service';
import { Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { LoginResponse } from '@app/modules/auth/models/login-response.model';
import { Response } from '../models/response.model';
import { SsrCookieService } from 'ngx-cookie-service-ssr';

interface IAuthInfo {
  userId: number;
  token: string;
  tokenExpiration?: Date;
  roleId: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  private authInfoKey = 'authInfo';

  private router: Router = inject(Router);
  private cookieService: SsrCookieService = inject(SsrCookieService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    super('auth');
  }

  login(username: string, password: string): Promise<Response<LoginResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      login: username,
      password: password,
      token: 'servidoresgadc12345',
    };
    return firstValueFrom(
      this.http.post<Response<LoginResponse>>(`${this.namespace}/login`, body, {
        headers,
      }),
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
      const cookies = this.cookieService.get(this.authInfoKey);
      if (!cookies) return null;
      return JSON.parse(cookies);
    }

    const authInfo = localStorage.getItem(this.authInfoKey);

    return authInfo ? JSON.parse(authInfo) : null;
  }

  logout() {
    if (typeof window === 'undefined') return;
    this.removeInfo();
    this.router.navigate(['/']);
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
    let cookieStr = JSON.stringify(authInfo);
    this.cookieService.set(this.authInfoKey, cookieStr);
  }

  private deleteCookie() {
    this.cookieService.delete(this.authInfoKey);
  }
}
