import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../../environments/enviroment';
import { inject } from '@angular/core';

export abstract class BaseService {
  protected baseUrl = enviroment.API_URL;
  protected readonly http: HttpClient = inject(HttpClient);
  protected namespace: string;

  constructor(namespace: string, version: string = 'v1') {
    this.namespace = `${this.baseUrl}/${version}/${namespace}`;
  }
}
