import { ACCESS_TYPES } from '@app/shared/constants/constants';

export interface FileModel {
  id: number;
  title: string;
  description: string;
  etag: string;
  accessType: ACCESS_TYPES;
  createdDate: string;
  modifiedDate: string;
  code: string;
  deleted: boolean;
  userId: number;
  folderId: number;
  password: string;
  minioLink: string;
  category: string;
  link?: string;
  qrId?: number;
  size: number;
  fileType: string;
}
