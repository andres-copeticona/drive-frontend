import { Injectable } from '@angular/core';
import { BaseCrudService } from '@app/shared/services/base-crud.service';
import { firstValueFrom } from 'rxjs';
import { FileModel } from '../models/file.model';
import { ResponseDto } from '@app/model/response';
import { CreateFile } from '../models/create-file.model';

@Injectable({
  providedIn: 'root',
})
export class FilesService extends BaseCrudService<FileModel> {
  constructor() {
    super('files');
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
  uploadFile(bucket: string, file: File, data: any): Promise<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify(data));

    const uploadURL = `${this.namespace}/upload/${bucket}`;

    return firstValueFrom(this.http.post(uploadURL, formData));
  }

  findByFolder(folderId: number): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.namespace}/folder/${folderId}`),
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
}
