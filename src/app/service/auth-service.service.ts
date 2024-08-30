import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private loginUrl = `${enviroment.API_URL}/api/v1/auth/login`;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      login: username,
      password: password,
      token: "servidoresgadc12345" // Token preestablecido
    };
    return this.http.post(this.loginUrl, body, { headers });
  }

  guardarDatosUsuario(datosUsuario: any): void {
    if (typeof window !== "undefined") {
      localStorage.setItem('userId', datosUsuario.usuarioID.toString()); // Convierte el ID a string para almacenarlo
      localStorage.setItem('userRole', datosUsuario.roles.nombreRol); // Asume que 'rol' está presente y es correcto
    }
  }

  obtenerIdUsuario(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem('userId');
    }
    return null;
  }

  obtenerRolUsuario(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem('userRole');
    }
    return null;
  }

  cerrarSesion(): void {
    if (typeof window !== "undefined") {
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
    return true; // Si no hay expiración, asumimos que el token ha expirado
  }
}
