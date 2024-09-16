import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QrCodeData } from '@app/modules/details-qr/models/qr-code-data';
import { firstValueFrom } from 'rxjs';
import { enviroment } from 'src/environments/enviroment';
import { IListResponse } from '../models/list-response';
import { Response } from '../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class QrService {
  baseUrl = enviroment.ANGULAR_URL;
  apiUrl = enviroment.API_URL;

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
    return `${this.baseUrl}/public/file/${code}/view`;
  }

  getSignQr(code: string) {
    return `${this.baseUrl}/public/details/${code}`;
  }

  getFolderQr(code: string) {
    return `${this.baseUrl}/public/folder/${code}`;
  }
}
