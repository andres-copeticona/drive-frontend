import { firstValueFrom } from 'rxjs';
import { IListResponse } from '../models/list-response';
import { BaseService } from './base.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Response } from '../models/response.model';

export abstract class BaseCrudService<T> extends BaseService {
  constructor(namespace: string, version: string = 'v1') {
    super(namespace, version);
  }

  async findMany(options?: {
    params?: HttpParams;
    headers?: HttpHeaders;
  }): Promise<Response<IListResponse<T>>> {
    return firstValueFrom(
      this.http.get<Response<IListResponse<T>>>(`${this.namespace}/`, {
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
  ): Promise<Response<T>> {
    return firstValueFrom(
      this.http.get<Response<T>>(`${this.namespace}/${id}`, {
        params: options?.params,
        headers: options?.headers,
      }),
    );
  }

  async store(
    data: Partial<T>,
    options?: { headers: HttpHeaders },
  ): Promise<Response<T>> {
    return firstValueFrom(
      this.http.post<Response<T>>(`${this.namespace}/`, data, {
        headers: options?.headers,
      }),
    );
  }

  async update(
    id: number | string,
    data: T,
    options?: { headers: HttpHeaders },
  ): Promise<Response<T>> {
    return firstValueFrom(
      this.http.put<Response<T>>(`${this.namespace}/${id}`, data, {
        headers: options?.headers,
      }),
    );
  }

  async delete(
    id: number | string,
    options?: { headers: HttpHeaders },
  ): Promise<Response<boolean>> {
    return firstValueFrom(
      this.http.delete<Response<boolean>>(`${this.namespace}/${id}`, {
        headers: options?.headers,
      }),
    );
  }
}
