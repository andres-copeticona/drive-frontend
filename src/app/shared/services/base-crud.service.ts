import { firstValueFrom } from 'rxjs';
import { IListResponse } from '../models/list-response';
import { BaseService } from './base.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { IResponse } from '../models/response.model';

export abstract class BaseCrudService<T> extends BaseService {
  constructor(namespace: string, version: string = 'v1') {
    super(namespace, version);
  }

  async findMany(options?: {
    params?: HttpParams;
    headers?: HttpHeaders;
  }): Promise<IListResponse<T>> {
    return firstValueFrom(
      this.http.get<IListResponse<T>>(`${this.namespace}/`, {
        params: options?.params,
        headers: options?.headers,
      }),
    );
  }

  async findOneBy(
    id: number | string,
    options?: {
      params: HttpParams;
      headers: HttpHeaders;
    },
  ): Promise<IResponse<T>> {
    return firstValueFrom(
      this.http.get<IResponse<T>>(`${this.namespace}/${id}`, {
        params: options?.params,
        headers: options?.headers,
      }),
    );
  }

  async store(data: T, options?: { headers: HttpHeaders }): Promise<T> {
    return firstValueFrom(
      this.http.post<T>(`${this.namespace}`, data, {
        headers: options?.headers,
      }),
    );
  }

  async update(
    id: number | string,
    data: T,
    options?: { headers: HttpHeaders },
  ): Promise<T> {
    return firstValueFrom(
      this.http.put<T>(`${this.namespace}/${id}`, data, {
        headers: options?.headers,
      }),
    );
  }

  async delete(
    id: number | string,
    options?: { headers: HttpHeaders },
  ): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.namespace}/${id}`, {
        headers: options?.headers,
      }),
    );
  }
}
