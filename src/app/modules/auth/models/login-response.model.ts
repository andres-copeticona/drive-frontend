import { User } from '@app/shared/models/user.model';

export interface LoginResponse {
  user: User;
  token: string;
  tokenExpiration: Date | string;
}
