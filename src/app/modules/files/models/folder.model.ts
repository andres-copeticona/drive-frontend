export interface Folder {
  id: number;
  name: string;
  code: string;
  accessType: string;
  creationDate: string;
  updateDate: string;
  deleted: boolean;
  userId: number;
  parentId?: number;
  parentFolderId: number;
}
