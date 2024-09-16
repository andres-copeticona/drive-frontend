import { Injectable } from '@angular/core';
import { BaseCrudService } from '@app/shared/services/base-crud.service';
import { Folder } from '../models/folder.model';
import { firstValueFrom } from 'rxjs';
import { Response } from '@app/shared/models/response.model';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { IListResponse } from '@app/shared/models/list-response';

@Injectable({
  providedIn: 'root',
})
export class FolderService extends BaseCrudService<Folder> {
  constructor() {
    super('folders');
  }

  async getPublics(options?: {
    params?: HttpParams;
    headers?: HttpHeaders;
  }): Promise<Response<IListResponse<Folder>>> {
    return firstValueFrom(
      this.http.get<Response<IListResponse<Folder>>>(
        `${this.namespace}/public`,
        {
          params: options?.params,
          headers: options?.headers,
        },
      ),
    );
  }

  getBreadcrumb(id: string | number): Promise<Response<Folder[]>> {
    return firstValueFrom(
      this.http.get<Response<Folder[]>>(`${this.namespace}/${id}/breadcrumb`),
    );
  }

  download(data: { id: string | number; title: string }): void {
    this.http
      .get(`${this.namespace}/${data.id}/download`, {
        responseType: 'blob',
      })
      .subscribe((res) => {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.title + '.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  async getPublicByCode(code: string) {
    return firstValueFrom(
      this.http.get<Response<Folder>>(this.namespace + '/public/' + code),
    );
  }

  async togglePrivacity(id: number | string) {
    return firstValueFrom(
      this.http.get<Response<string>>(
        this.namespace + `/${id}/toggle-privacity`,
      ),
    );
  }
}
