import { User } from '@app/shared/models/user.model';

export interface Activity {
  description: string;
  ip: string;
  activityType: string;
  date: string;
  user: User;
}
