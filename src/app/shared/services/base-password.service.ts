import { ResponseDto } from '@app/model/response';

export interface BasePasswordService {
  checkPassword(
    password: string,
    id?: number | string,
  ): Promise<ResponseDto<boolean>>;
}
