import { Injectable } from '@angular/core';
import { enviroment } from '../../environments/enviroment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActividadcompartidoService {
  private baseUrl = enviroment.API_URL;

  constructor(private http: HttpClient) { }

  // Metodo para crear una Actividad compartida
  createActividadCompartido(actividadCompartidoData: any): Observable<any> {
    const url = `${this.baseUrl}/api/actividad-compartido/create`;
    return this.http.post(url, actividadCompartidoData);
  }

  // Metodo para obtener el totoal de contradores por idFolder y idArchivo
  getTotalContador(idFolder: number, idArchivo: number): Observable<number>{
      const url = `${this.baseUrl}/api/actividad-compartido/total-contador`;
      return this.http.get<number>(url, {
        params:{
          idFolder: idFolder.toString(),
          idArchivo: idArchivo.toString()
        }
      });
  }

  // Metodo para obtener todos los archivos con sus contadores sumados
  getArchivosContadores(): Observable<any[]>{
    const url = `${this.baseUrl}/api/actividad-compartido/all-archivos-contadores`;
    return this.http.get<any[]>(url);
  }

}
