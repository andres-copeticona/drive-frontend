import { User } from '@app/shared/models/user.model';
import { FileModel } from './file.model';

export interface ShareFile {
  id: number;
  file: FileModel;
  emitter: User;
  receptor: User;
  sharedAt: Date;
  fileLink: string;
}
