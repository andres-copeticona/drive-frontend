export interface FileModel {
  id: number;
  title: string;
  description: string;
  etag: string;
  accessType: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
  userId: number;
  folderId: number;
  password: string;
  minioLink: string;
  categoria: string;
  link?: string;
  size: number;
  fileType: string;
}
