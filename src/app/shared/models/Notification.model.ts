import { User } from './user.model';

export interface Notification {
  id: number;
  user?: User;
  title: string;
  message: string;
  type: string;
  read: boolean;
  date: string;
}
