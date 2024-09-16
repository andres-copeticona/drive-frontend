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
import { ShareFileService } from '@app/modules/files/services/share-file.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FolderService } from '@app/modules/files/services/folder.service';

@Component({
  selector: 'app-share-dialog',
  standalone: true,
  imports: [
    MatSlideToggleModule,
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

  service!: ShareFolderService | ShareFileService;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type: 'folder' | 'file';
      code: string | number;
      id: number;
      accessType: string;
    },
    private ref: MatDialogRef<ShareDialogComponent>,
    public qrService: QrService,
    private userService: UserService,
    private folderService: FolderService,
    private shareFolderService: ShareFolderService,
    private shareFileService: ShareFileService,
    private ts: ToastrService,
  ) {}

  async ngOnInit() {
    this.service =
      this.data.type === 'folder'
        ? this.shareFolderService
        : this.shareFileService;

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

  async shareUser() {
    const value = this.userControl.value;
    if (
      this.userControl.invalid ||
      typeof value == 'string' ||
      !(value as any)?.id
    ) {
      this.ts.error('Por favor seleccione un usuario', 'Error');
      return;
    }

    try {
      const res = await this.service.shareUser({
        id: this.data.id,
        receptorIds: [(value as any).id!],
      });
      this.ts.success(res.message, 'Éxito');
      this.ref.close(true);
    } catch (error: any) {
      console.error(error);
      const msg = error.error?.message || 'Error al compartir archivos';
      this.ts.error(msg, 'Error');
    }
  }

  async shareAll() {
    try {
      const res = await this.service.shareAll(this.data.id);
      this.ts.success(res.message, 'Éxito');
      this.ref.close(true);
    } catch (error: any) {
      console.error(error);
      const msg = error.error?.message || 'Error al compartir archivos';
      this.ts.error(msg, 'Error');
    }
  }

  async shareDependency() {
    const value = this.dependencyControl.value;
    if (
      this.dependencyControl.invalid ||
      !this.dependencies.includes(value ?? '')
    ) {
      this.ts.error('Por favor seleccione una dependencia', 'Error');
      return;
    }

    try {
      const res = await this.service.shareDependency(this.data.id, value!);
      this.ts.success(res.message, 'Éxito');
      this.ref.close(true);
    } catch (error: any) {
      console.error(error);
      const msg = error.error?.message || 'Error al compartir archivos';
      this.ts.error(msg, 'Error');
    }
  }

  async onPrivacityChange() {
    if (this.data.type !== 'folder') return;
    try {
      const res = await this.folderService.togglePrivacity(this.data.id);
      this.data.accessType = res.data;
      this.ts.success('Privacidad cambiada', 'Éxito');
    } catch (error) {
      console.error(error);
      this.ts.error('Error al cambiar la privacidad de la carpeta', 'Error');
    }
  }
}
