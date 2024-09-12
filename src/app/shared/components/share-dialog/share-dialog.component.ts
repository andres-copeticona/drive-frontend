import { Component, Inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  MatDialogTitle,
  MatDialogContent,
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { QRCodeModule } from 'angularx-qrcode';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { User } from '@app/shared/models/user.model';
import { UserService } from '@app/modules/user/services/user.service';
import { QrService } from '@app/shared/services/qr.service';
import { ToastrService } from 'ngx-toastr';
import { MatTabsModule } from '@angular/material/tabs';
import { ShareFolderService } from '@app/modules/files/services/share-folder.service';

@Component({
  selector: 'app-share-dialog',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatCardModule,
    MatMenuModule,
    MatTooltipModule,
    MatSelectModule,
    AsyncPipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatDialogClose,
    MatDialogActions,
    QRCodeModule,
    MatTabsModule,
    MatDialogTitle,
    MatDialogContent,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './share-dialog.component.html',
  styleUrl: './share-dialog.component.css',
})
export class ShareDialogComponent implements OnInit {
  qrUrl: string = '';
  users: User[] = [];
  filteredUsers?: Observable<User[]>;

  dependencies: string[] = [];
  filteredDependencies?: Observable<string[]>;

  userControl = new FormControl<string>('');
  dependencyControl = new FormControl<string>('');

  showQr = false;

  selectedUser?: User;
  selectedDependency!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { type: 'folder' | 'file'; code: string | number; id: number },
    private ref: MatDialogRef<ShareDialogComponent>,
    public qrService: QrService,
    private userService: UserService,
    private shareFolderService: ShareFolderService,
    private ts: ToastrService,
  ) {}

  async ngOnInit() {
    this.qrUrl =
      this.data.type === 'folder'
        ? this.qrService.getFolderQr(this.data.code as string)
        : this.qrService.getFileQr(this.data.code as string);

    this.users = (await this.userService.findMany())?.data?.data ?? [];
    this.dependencies = (await this.userService.getDependencies())?.data ?? [];

    this.filteredUsers = this.userControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if (!value) return [];
        if (value == '') return [];
        if (typeof value !== 'string') return [];

        return this.users.filter((user) => {
          return user.fullName
            ?.toLowerCase()
            .includes(value?.toLowerCase() ?? '');
        });
      }),
    );

    this.filteredDependencies = this.dependencyControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if (!value) return [];
        if (value == '') return [];

        return this.dependencies.filter((dep) => {
          return dep?.toLowerCase().includes(value?.toLowerCase());
        });
      }),
    );
  }

  displayFn(user: User): string {
    return user.fullName;
  }

  copyText() {
    navigator.clipboard
      .writeText(this.qrUrl)
      .then(() => {
        this.ts.success('Texto copiado al portapapeles', 'Texto copiado');
      })
      .catch((err) => {
        console.error(err);
        this.ts.error('Error al copiar texto al portapapeles', 'Error');
      });
  }

  shareUser() {
    const value = this.userControl.value;
    if (
      this.userControl.invalid ||
      typeof value == 'string' ||
      !(value as any)?.id
    ) {
      this.ts.error('Por favor seleccione un usuario', 'Error');
      return;
    }

    this.shareFolderService
      .shareUser({
        id: this.data.id,
        receptorIds: [(value as any).id!],
      })
      .then(() => {
        this.ts.success('Carpeta compartida con éxito', 'Éxito');
        this.ref.close(true);
      })
      .catch((err) => {
        console.error(err);
        this.ts.error('Error al compartir carpeta', 'Error');
      });
  }

  shareAll() {}

  shareDependency() {
    const value = this.dependencyControl.value;
    if (
      this.dependencyControl.invalid ||
      !this.dependencies.includes(value ?? '')
    ) {
      this.ts.error('Por favor seleccione una dependencia', 'Error');
      return;
    }
  }
}
