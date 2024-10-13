import { Injectable } from '@angular/core';
import { BaseCrudService } from '@app/shared/services/base-crud.service';
import { firstValueFrom } from 'rxjs';
import { FileModel } from '../models/file.model';
import { CreateFile } from '../models/create-file.model';
import { BasePasswordService } from '@app/shared/services/base-password.service';
import { UsageStorage } from '@app/modules/home/models/usage-storage.model';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { IListResponse } from '@app/shared/models/list-response';
import { Response } from '@app/shared/models/response.model';

@Injectable({
  providedIn: 'root',
})
export class FilesService
  extends BaseCrudService<FileModel>
  implements BasePasswordService
{
  constructor() {
    super('files');
  }

  async getPublics(options?: {
    params?: HttpParams;
    headers?: HttpHeaders;
  }): Promise<Response<IListResponse<FileModel>>> {
    return firstValueFrom(
      this.http.get<Response<IListResponse<FileModel>>>(
        `${this.namespace}/public`,
        {
          params: options?.params,
          headers: options?.headers,
        },
      ),
    );
  }

  async getPublicByCode(code: string) {
    return firstValueFrom(
      this.http.get<Response<FileModel>>(this.namespace + '/public/' + code),
    );
  }

  uploadFiles(createFile: CreateFile): Promise<Response<FileModel[]>> {
    const uploadURL = `${this.namespace}/upload`;
    return firstValueFrom(
      this.http.post<Response<FileModel[]>>(uploadURL, createFile.toFormData()),
    );
  }

  download(file: FileModel): void {
    const downloadURL = `${this.namespace}/${file.id}/download`;
    this.http.get(downloadURL, { responseType: 'blob' }).subscribe((res) => {
      const blob = new Blob([res], { type: res.type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  publicDownload(file: FileModel): void {
    const downloadURL = `${this.namespace}/public/${file.code}/download`;
    this.http.get(downloadURL, { responseType: 'blob' }).subscribe((res) => {
      const blob = new Blob([res], { type: res.type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  checkPassword(
    password: string,
    id?: number | string,
  ): Promise<Response<boolean>> {
    return firstValueFrom(
      this.http.post<Response<boolean>>(
        `${this.namespace}/${id}/check-password`,
        {
          password,
        },
      ),
    );
  }

  getUsage(userId: number): Promise<Response<UsageStorage>> {
    return firstValueFrom(
      this.http.get<Response<UsageStorage>>(`${this.namespace}/usage-storage`, {
        params: { userId },
      }),
    );
  }

  signFile(
    data: FormData,
  ): Promise<Response<{ file: FileModel; qrCode: string }>> {
    return firstValueFrom(
      this.http.post<Response<{ file: FileModel; qrCode: string }>>(
        `${this.namespace}/sign`,
        data,
      ),
    );
  }

  getQrCode(fileId: number): Promise<Response<string>> {
    return firstValueFrom(
      this.http.get<Response<string>>(`${this.namespace}/${fileId}/qr-code`),
    );
  }
}
