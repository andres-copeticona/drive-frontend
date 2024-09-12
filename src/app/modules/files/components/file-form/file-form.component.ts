import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DropzoneCdkModule, FileInputValidators } from '@ngx-dropzone/cdk';
import { DropzoneMaterialModule } from '@ngx-dropzone/material';
import { MatChipsModule } from '@angular/material/chips';
import { Response } from '@app/shared/models/response.model';
import { FileModel } from '../../models/file.model';
import { FilesService } from '../../services/files.service';
import { CreateFile } from '../../models/create-file.model';
import { MatSelectModule } from '@angular/material/select';
import { ACCESS_TYPES } from '@app/shared/constants/constants';

@Component({
  selector: 'app-file-form',
  standalone: true,
  imports: [
    CommonModule,

    DropzoneCdkModule,
    DropzoneMaterialModule,

    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './file-form.component.html',
  styleUrl: './file-form.component.css',
})
export class FileFormComponent implements OnInit {
  isLoading = false;
  hide = true;
  showPasswordField = false;
  aceptedFiles: string = '.jpg,.jpeg,.pdf,.mp4,.mp3';

  get files(): File[] {
    return (this?.fileControl?.value ?? []) as File[];
  }

  validators: any = [
    Validators.required,
    FileInputValidators.accept(this.aceptedFiles),
    FileInputValidators.maxSize(1024 * 1024 * 1024),
  ];
  fileControl = new FormControl<File[] | null>(null, this.validators);

  accessTypes: string[] = [
    ACCESS_TYPES.PUBLIC,
    ACCESS_TYPES.PRIVATE,
    ACCESS_TYPES.RESTRICTED,
  ];

  accessType = new FormControl<string>(ACCESS_TYPES.PRIVATE, [
    Validators.required,
  ]);

  passControl = new FormControl<string>('');

  constructor(
    private fileService: FilesService,
    private ts: ToastrService,
    private ref: MatDialogRef<FileFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { parentId: number },
  ) {}

  onRemove(file: File) {
    this.fileControl?.setValue(this.files.filter((f) => f !== file) as any);
  }

  ngOnInit(): void {}

  async uploadFiles() {
    if (this.fileControl.invalid) return;
    if (this.fileControl.value?.length === 0) return;

    this.isLoading = true;
    let res: Response<FileModel[]> | undefined;
    try {
      const createFile = new CreateFile();
      createFile.files = this.files;
      createFile.folderId = this.data?.parentId;
      createFile.accessType = this.accessType?.value as ACCESS_TYPES;
      createFile.password = this.passControl?.value ?? undefined;

      res = await this.fileService.uploadFiles(createFile);

      this.isLoading = false;
      this.fileControl.setValue(null);
      this.ref.close(res);
      this.ts.success('Archivos subidos correctamente');
    } catch (error) {
      console.error(error);
      this.ts.error('Error al subir los archivos');
    }
  }

  onAccessTypeChange(type: ACCESS_TYPES) {
    this.showPasswordField = type === ACCESS_TYPES.RESTRICTED;
    if (this.showPasswordField)
      this.passControl.setValidators([Validators.required]);
    else this.passControl.clearValidators();
  }
}
