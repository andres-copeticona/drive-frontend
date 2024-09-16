import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Notification } from '../models/Notification.model';
import { firstValueFrom } from 'rxjs';
import { Response } from '../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService extends BaseCrudService<Notification> {
  constructor() {
    super('notifications');
  }

  async markAsRead(id: number): Promise<Response<boolean>> {
    return firstValueFrom(
      this.http.post<Response<boolean>>(`${this.namespace}/${id}/read`, null),
    );
  }

  async sendAll(body: {
    title: string;
    message: string;
  }): Promise<Response<boolean>> {
    return firstValueFrom(
      this.http.post<Response<boolean>>(`${this.namespace}/all`, body),
    );
  }
}
