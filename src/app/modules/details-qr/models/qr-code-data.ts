import { FileModel } from '@app/modules/files/models/file.model';
import { User } from '@app/shared/models/user.model';

export interface QrCodeData {
  id: number;
  emitter: User;
  title: string;
  message: string;
  creationDate: Date;
  file: FileModel;
}
