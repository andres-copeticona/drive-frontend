import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@app/model/response';
import { QrCodeData } from '@app/modules/details-qr/models/qr-code-data';
import { firstValueFrom } from 'rxjs';
import { enviroment } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class QrService {
  baseUrl = enviroment.ANGULAR_URL;
  apiUrl = enviroment.API_URL;

  constructor(private http: HttpClient) {}

  async getQrData(code: string) {
    return firstValueFrom(
      this.http.get<ResponseDto<QrCodeData>>(
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
