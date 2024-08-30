import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  // Asegúrate de que tu URL de la API sea correcta
  // La propiedad debe llamarse 'environment' y no 'enviroment'
  private apiUrl: string = `${enviroment.API_URL}/file`;

  constructor(private httpClient: HttpClient) { }

  // Método para obtener la lista de usuarios compartidos para un documento
  getSharedDocuments(userId: number): Observable<any[]> {
    const url = `${this.apiUrl}/shared-documents/${userId}`;
    return this.httpClient.get<any[]>(url);
  }

  // Método para compartir un documento
  shareDocument(shareData: { documentoId: number; receptorUsuarioId: number; emisorUsuarioId: number; tipoAcceso: string }): Observable<any> {
    const shareUrl = `${this.apiUrl}/share`;
    return this.httpClient.post(shareUrl, shareData);
  }

  

}
