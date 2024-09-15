import { Injectable } from '@angular/core';
import { BaseCrudService } from '@app/shared/services/base-crud.service';
import { firstValueFrom } from 'rxjs';
import { Response } from '@app/shared/models/response.model';
import { ShareFile } from '../models/share-file.model';

@Injectable({
  providedIn: 'root',
})
export class ShareFileService extends BaseCrudService<ShareFile> {
  constructor() {
    super('share-files');
  }

  async shareUser(data: {
    id: string | number;
    receptorIds: (string | number)[];
  }) {
    return firstValueFrom(
      this.http.post<Response<boolean>>(this.namespace + '/', {
        ...data,
        type: 'usuario',
      }),
    );
  }

  async shareAll(id: string | number) {
    return firstValueFrom(
      this.http.post<Response<boolean>>(this.namespace + '/all', {
        id,
        type: 'todos',
      }),
    );
  }

  async shareDependency(id: string | number, dependency: string) {
    return firstValueFrom(
      this.http.post<Response<boolean>>(this.namespace + '/dependency', {
        id,
        dependency,
        type: 'dependencia',
      }),
    );
  }
}
