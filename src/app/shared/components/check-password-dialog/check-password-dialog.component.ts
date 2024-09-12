import { Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BasePasswordService } from '@app/shared/services/base-password.service';
import { ToastrService } from 'ngx-toastr';

export interface CheckPasswordDialogData {
  service: BasePasswordService;
  id?: number | string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './check-password-dialog.component.html',
  styleUrl: './check-password-dialog.component.css',
})
export class CheckPasswordDialogComponent {
  hide = true;

  passControl = new FormControl('', [Validators.required]);

  constructor(
    private ts: ToastrService,
    public ref: MatDialogRef<CheckPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: CheckPasswordDialogData,
  ) {}

  async onConfirm() {
    if (!this.data?.service) {
      this.ref.close(false);
      return;
    }
    const pass = this.passControl.value!;
    try {
      const res = await this.data.service.checkPassword(pass, this.data.id);
      if (res.data) this.ref.close(true);
    } catch (error) {
      console.error(error);
      this.ts.error('Contraseña incorrecta', 'Error');
    }
  }
}
