export enum AccessType {
  PRIVATE = 'privado',
  PUBLIC = 'publico',
  RESTRICTED = 'restringido',
}

export class CreateFile {
  files?: File[];
  accessType: AccessType = AccessType.PUBLIC;
  password?: string;
  folderId?: number;

  constructor(init?: Partial<CreateFile>) {
    Object.assign(this, init);
  }

  toFormData(): FormData {
    const formData = new FormData();
    formData.append('accessType', this.accessType.toString());
    if (this.password) formData.append('password', this.password);
    formData.append('folderId', this.folderId?.toString() ?? '');
    if (this.files) {
      this.files.forEach((file) => {
        formData.append('files', file);
      });
    }
    return formData;
  }
}