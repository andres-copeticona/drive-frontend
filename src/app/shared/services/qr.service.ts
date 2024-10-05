import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QrCodeData } from '@app/modules/details-qr/models/qr-code-data';
import { firstValueFrom } from 'rxjs';
import { IListResponse } from '../models/list-response';
import { Response } from '../models/response.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QrService {
  baseUrl = environment.ANGULAR_URL;
  apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  async findMany(options?: {
    params?: HttpParams;
    headers?: HttpHeaders;
  }): Promise<Response<IListResponse<QrCodeData>>> {
    return firstValueFrom(
      this.http.get<Response<IListResponse<QrCodeData>>>(
        `${this.apiUrl}/v1/qr/`,
        {
          params: options?.params,
          headers: options?.headers,
        },
      ),
    );
  }

  async getQrData(code: string) {
    return firstValueFrom(
      this.http.get<Response<QrCodeData>>(
        `${this.apiUrl}/v1/qr/public/${code}`,
      ),
    );
  }

  getFileQr(code: string) {
    return `${this.baseUrl}/publico/archivos/${code}/ver`;
  }

  getSignQr(code: string) {
    return `${this.baseUrl}/publico/detalles/${code}`;
  }

  getFolderQr(code: string) {
    return `${this.baseUrl}/publico/carpetas/${code}`;
  }
}
