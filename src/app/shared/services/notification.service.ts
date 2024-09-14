import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Notification } from '../models/Notification.model';
import { ResponseDto } from '@app/model/response';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService extends BaseCrudService<Notification> {
  constructor() {
    super('notifications');
  }

  async markAsRead(id: number): Promise<ResponseDto<boolean>> {
    return firstValueFrom(
      this.http.post<ResponseDto<boolean>>(
        `${this.namespace}/${id}/read`,
        null,
      ),
    );
  }

  async sendAll(body: {
    title: string;
    message: string;
  }): Promise<ResponseDto<boolean>> {
    return firstValueFrom(
      this.http.post<ResponseDto<boolean>>(`${this.namespace}/all`, body),
    );
  }
}
