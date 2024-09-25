import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from 'src/environments/environment';

export abstract class BaseService {
  protected baseUrl = environment.API_URL;
  protected readonly http: HttpClient = inject(HttpClient);
  protected namespace: string;

  constructor(namespace: string, version: string = 'v1') {
    this.namespace = `${this.baseUrl}/${version}/${namespace}`;
  }
}
