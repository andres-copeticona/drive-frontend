import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FolderService } from '../../services/folder.service';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Response } from '@app/shared/models/response.model';
import { Folder } from '../../models/folder.model';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-folder-form',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './folder-form.component.html',
  styleUrl: './folder-form.component.css',
})
export class FolderFormComponent implements OnInit {
  formGroup!: FormGroup;

  get formControls(): any {
    return this.formGroup.controls;
  }

  constructor(
    private fb: FormBuilder,
    private folderService: FolderService,
    private ts: ToastrService,
    private ref: MatDialogRef<Folder>,
    @Inject(MAT_DIALOG_DATA) public data?: { parentId: number },
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.formGroup = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30),
        ],
      ],
    });
  }

  async save() {
    if (this.formGroup.invalid) return;

    const { name } = this.formGroup.value;
    try {
      const res = await this.folderService.store({
        name,
        parentId: this.data?.parentId,
      });
      this.ref.close(res?.data);
      this.ts.success(res?.message ?? 'Carpeta guardada', 'Guardado');
    } catch (error: any) {
      console.error(error);
      const msg = error?.error?.message ?? 'Error al guardar la carpeta';
      this.ts.error(msg, 'Error');
    }
  }
}
