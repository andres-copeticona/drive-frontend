
import { Injectable } from '@angular/core';
import { enviroment } from '../../environments/enviroment';
import { HttpClient } from '@angular/common/http';
import { AuthServiceService } from './auth-service.service';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private baseUrl = `${enviroment.API_URL}/api/v1/auth/user`;

  constructor(private http: HttpClient, private authService: AuthServiceService) { }

  obtenerDatosUsuario(): Observable<any> {
    const userId = this.authService.obtenerIdUsuario();

    if (!userId) {
      throw new Error('ID de usuario no encontrado');
    }

    return this.http.get(`${this.baseUrl}/${userId}`).pipe(
      tap(response => console.log('Datos del usuario:', response)) // Imprimir la respuesta
    );
  }

  // En tu UsuarioService

getAllUsers(): Observable<any> {
  return this.http.get(`${this.baseUrl}s`); // Asegúrate de que la URL sea correcta.
}

getUserProfile(id: number): Observable<any> {
    let userId: number; // Declare the userId variable
    userId = id;

    if (!userId) {
      throw new Error('ID de usuario no encontrado');
    }

    return this.http.get(`${this.baseUrl}/${userId}`).pipe(
      tap(response => console.log('Datos del usuario:', response)) // Imprimir la respuesta
    );
}

obtenerRoles(): Observable<any> {
  return this.http.get(`${enviroment.API_URL}/api/v1/auth/roles`);
}

cambiarRolUsuario(userId: number, rolId: number): Observable<any> {
  return this.http.put(`${enviroment.API_URL}/api/v1/auth/change-role/${userId}/${rolId}`, null);
}

}
