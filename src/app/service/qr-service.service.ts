import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseDto } from '../model/response';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../environments/enviroment';
import { QrCode } from '../model/qrCode';

@Injectable({
  providedIn: 'root'
})
export class QrServiceService {

  private API_SERVER = `${enviroment.API_URL}/api/v1/qr`;

  constructor(private httpClient: HttpClient) { }

  // Método para guardar un nuevo código QR
  public saveQrCode(qrCode: QrCode): Observable<ResponseDto<QrCode>> {
    return this.httpClient.post<ResponseDto<QrCode>>(`${this.API_SERVER}/save`, qrCode);
  }

  // Método para obtener un código QR por su ID
  public getQrCodeById(id: number): Observable<ResponseDto<QrCode>> {
    return this.httpClient.get<ResponseDto<QrCode>>(`${this.API_SERVER}/codeqr/${id}`);
  }
}
