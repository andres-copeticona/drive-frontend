import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class QrService {
  baseUrl = enviroment.ANGULAR_URL;

  getFileQr(code: string) {
    return `${this.baseUrl}/public/file/${code}`;
  }

  getSignQr(code: string) {
    return `${this.baseUrl}/public/details/${code}`;
  }

  getFolderQr(code: string) {
    return `${this.baseUrl}/public/folder/${code}`;
  }
}
