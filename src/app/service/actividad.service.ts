import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private baseUrl = enviroment.API_URL; // Usa la URL base del environment

  constructor(private http: HttpClient) { } // Inyecta HttpClient

  // Método para crear una actividad
  crearActividad(actividadData: any): Observable<any> {
    const url = `${this.baseUrl}/api/actividades/crearactividad`; // Construye la URL completa
    return this.http.post(url, actividadData); // Realiza la petición POST
  }
  public listActivities(): Observable<any> {
    const listActivities = `${this.baseUrl}/api/actividades/todas`;
    return this.http.get(listActivities);
  }
}
