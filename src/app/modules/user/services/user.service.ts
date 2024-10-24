import { Injectable } from '@angular/core';
import { Response } from '@app/shared/models/response.model';
import { User } from '@app/shared/models/user.model';
import { BaseCrudService } from '@app/shared/services/base-crud.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseCrudService<User> {
  constructor() {
    super('users');
  }

  async updateRole(userId: number, roleId: number): Promise<User> {
    return firstValueFrom(
      this.http.put<User>(
        `${this.namespace}/change-role/${userId}/${roleId}`,
        null,
      ),
    );
  }

  async getDependencies(): Promise<Response<string[]>> {
    return firstValueFrom(
      this.http.get<Response<string[]>>(`${this.namespace}/dependencies`),
    );
  }
}
