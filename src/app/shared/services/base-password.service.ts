import { Response } from '../models/response.model';

export interface BasePasswordService {
  checkPassword(
    password: string,
    id?: number | string,
  ): Promise<Response<boolean>>;
}
