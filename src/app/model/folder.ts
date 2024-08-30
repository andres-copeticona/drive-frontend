export interface FolderDto {
  id: number;
  name: string;
  accessType: string;
  creationDate: string;
  updateDate: string;
  deleted: boolean;
  userId: number;
  parentFolderId: number | null;
}
