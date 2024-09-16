import { Injectable } from '@angular/core';
import { BaseCrudService } from '@app/shared/services/base-crud.service';
import { firstValueFrom } from 'rxjs';
import { FileModel } from '../models/file.model';
import { ResponseDto } from '@app/model/response';
import { CreateFile } from '../models/create-file.model';
import { BasePasswordService } from '@app/shared/services/base-password.service';
import { UsageStorage } from '@app/modules/home/models/usage-storage.model';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { IListResponse } from '@app/shared/models/list-response';

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
  }): Promise<ResponseDto<IListResponse<FileModel>>> {
    return firstValueFrom(
      this.http.get<ResponseDto<IListResponse<FileModel>>>(
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
      this.http.get<ResponseDto<FileModel>>(this.namespace + '/public/' + code),
    );
  }

  uploadFiles(createFile: CreateFile): Promise<ResponseDto<FileModel[]>> {
    const uploadURL = `${this.namespace}/upload`;
    return firstValueFrom(
      this.http.post<ResponseDto<FileModel[]>>(
        uploadURL,
        createFile.toFormData(),
      ),
    );
  }

  download(file: FileModel): void {
    const downloadURL = `${this.namespace}/${file.id}/download`;
    this.http.get(downloadURL, { responseType: 'blob' }).subscribe((res) => {
      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  publicDownload(file: FileModel): void {
    const downloadURL = `${this.namespace}/public/${file.code}/download`;
    this.http.get(downloadURL, { responseType: 'blob' }).subscribe((res) => {
      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  checkPassword(
    password: string,
    id?: number | string,
  ): Promise<ResponseDto<boolean>> {
    return firstValueFrom(
      this.http.post<ResponseDto<boolean>>(
        `${this.namespace}/${id}/check-password`,
        {
          password,
        },
      ),
    );
  }

  getUsage(userId: number): Promise<ResponseDto<UsageStorage>> {
    return firstValueFrom(
      this.http.get<ResponseDto<UsageStorage>>(
        `${this.namespace}/usage-storage`,
        { params: { userId } },
      ),
    );
  }

  signFile(
    data: FormData,
  ): Promise<ResponseDto<{ file: FileModel; qrCode: string }>> {
    return firstValueFrom(
      this.http.post<ResponseDto<{ file: FileModel; qrCode: string }>>(
        `${this.namespace}/sign`,
        data,
      ),
    );
  }

  getQrCode(fileId: number): Promise<ResponseDto<string>> {
    return firstValueFrom(
      this.http.get<ResponseDto<string>>(`${this.namespace}/${fileId}/qr-code`),
    );
  }
}
