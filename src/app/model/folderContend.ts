import { FileDto } from "./file";
import { FolderDto } from "./folder";

export interface FolderContentsDto {
  folders: FolderDto[];
  files: FileDto[];
}
