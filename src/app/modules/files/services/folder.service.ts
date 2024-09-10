import { Injectable } from '@angular/core';
import { BaseCrudService } from '@app/shared/services/base-crud.service';
import { Folder } from '../models/folder.model';
import { firstValueFrom } from 'rxjs';
import { Response } from '@app/shared/models/response.model';

@Injectable({
  providedIn: 'root',
})
export class FolderService extends BaseCrudService<Folder> {
  constructor() {
    super('folders');
  }

  getBreadcrumb(id: string | number): Promise<Response<Folder[]>> {
    return firstValueFrom(
      this.http.get<Response<Folder[]>>(`${this.namespace}/${id}/breadcrumb`),
    );
  }
}
