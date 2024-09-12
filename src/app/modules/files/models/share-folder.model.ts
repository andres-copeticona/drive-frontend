import { User } from '@app/shared/models/user.model';
import { Folder } from './folder.model';

export interface ShareFolder {
  id: number;
  folder: Folder;
  emisor: User;
  receptor: User;
  sharedAt: Date;
}
