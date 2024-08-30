import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { enviroment } from '../../environments/enviroment';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = `${enviroment.API_URL}/api/notificaciones`;

  constructor(private http: HttpClient, private authService: AuthServiceService) { }

  obtenerNotificacionesNoleidas(): Observable<any> {
    const userId = this.authService.obtenerIdUsuario();

    if (!userId) {
      throw new Error('ID de usuario no encontrado');
    }

    return this.http.get(`${this.baseUrl}/no-leidas/usuario/${userId}`).pipe(
      tap(response => console.log('DNotifiaciones no leidas:', response)) // Imprimir la respuesta
    );
  }

  public notifleida(idnoti: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/marcar-como-leida/${idnoti}`, null);
  }

  public sendmessage(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/crear-masiva`, body);
  }
}
