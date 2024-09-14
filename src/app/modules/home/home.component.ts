import { AsyncPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TruncatePipe } from '../../truncate.pipe';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { TruncateDocumentNamePipe } from '../../pipes/truncate-document-name.pipe';

import { CommonModule } from '@angular/common';
import { FileModel } from '../files/models/file.model';
import { Notification } from '@app/shared/models/Notification.model';
import { ToastrService } from 'ngx-toastr';
import { FilesService } from '../files/services/files.service';
import { HttpParams } from '@angular/common/http';
import { AuthService } from '@app/shared/services/auth.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { ListItemComponent } from '../files/components/item/item.component';
import { ItemList } from '../files/models/item.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { UsageStorage } from './models/usage-storage.model';
import { MatDialog } from '@angular/material/dialog';
import { SignPdfComponent } from './components/sign-pdf/sign-pdf.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: [
    CommonModule,
    MatListModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressBarModule,
    FormsModule,
    AsyncPipe,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    TruncatePipe,
    FormatDatePipe,
    TruncateDocumentNamePipe,

    MatExpansionModule,

    ListItemComponent,
  ],
})
export class HomeComponent implements OnInit {
  isLoading = signal(false);

  recentFiles = signal<FileModel[]>([]);
  notifications = signal<Notification[]>([]);
  usageStorage = signal<UsageStorage | null>(null);

  totalSpace = 1024 * 1024 * 1024;
  calcPercentage(n?: number) {
    return ((n ?? 0) / this.totalSpace) * 100;
  }
  calcMb(n?: number) {
    return (n ?? 0) / 1024 / 1024;
  }

  calcGb(n?: number) {
    return (n ?? 0) / 1024 / 1024 / 1024;
  }

  roleId = this.authService.getInfo()?.roleId;
  formGroup!: FormGroup;

  formControls(): any {
    return this.formGroup?.controls ?? {};
  }

  constructor(
    private authService: AuthService,
    private fileService: FilesService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private ts: ToastrService,
  ) {
    if (this.roleId == 1) {
      this.formGroup = this.fb.group({
        title: ['', [Validators.required]],
        message: ['', [Validators.required]],
      });
    }
  }

  async ngOnInit() {
    await this.getRecentFiles();
    await this.getNotifications();
    await this.getUsageStorage();
    this.isLoading.set(false);
  }

  async getRecentFiles() {
    try {
      const res = await this.fileService.findMany({
        params: new HttpParams({
          fromObject: {
            page: 0,
            size: 5,
            sortDirection: 'desc',
            createdBy: this.authService.getInfo()?.userId!,
          },
        }),
      });
      this.recentFiles.set(res?.data?.data ?? []);
    } catch (error) {
      console.error(error);
      this.ts.error('Error al obtener los archivos recientes', 'Error');
    }
  }

  async getNotifications() {
    try {
      const res = await this.notificationService.findMany({
        params: new HttpParams({
          fromObject: {
            page: 0,
            size: 5,
            sortDirection: 'desc',
            userId: this.authService.getInfo()?.userId!,
            isRead: false,
          },
        }),
      });
      this.notifications.set(res?.data?.data ?? []);
    } catch (error) {
      console.error(error);
      this.ts.error('Error al obtener las notificaciones', 'Error');
    }
  }

  async getUsageStorage() {
    try {
      const res = await this.fileService.getUsage(
        this.authService.getInfo()?.userId!,
      );
      this.usageStorage.set(res?.data ?? {});
    } catch (error) {
      console.error(error);
      this.ts.error('Error al obtener el uso de almacenamiento', 'Error');
    }
  }

  toItem(item: FileModel): ItemList {
    let icon = 'picture_as_pdf';
    if (item.fileType) {
      if (item.fileType.includes('image')) icon = 'image';
      else if (item.fileType.includes('video')) icon = 'movie';
      else if (item.fileType.includes('audio')) icon = 'graphic_eq';
      else if (item.fileType.includes('audio')) icon = 'graphic_eq';
    }

    return {
      id: item.id.toString(),
      name: item.title,
      accessType: item.accessType,
      code: item.code,
      type: item.fileType,
      icon,
    };
  }

  async markAsRead(notification: Notification) {
    try {
      await this.notificationService.markAsRead(notification.id);
      await this.getNotifications();
    } catch (error) {
      console.error(error);
      this.ts.error('Error al marcar la notificación como leída', 'Error');
    }
  }

  async sendAllMessage() {
    this.formGroup.markAllAsTouched();
    this.formGroup.markAsDirty();

    if (this.formGroup.invalid) return;

    try {
      const res = await this.notificationService.sendAll(this.formGroup.value);
      this.ts.success(res.message, 'Éxito');
      this.formGroup.reset();
      this.getNotifications();
    } catch (error) {
      const message = (error as any)?.error?.message;
      console.error(error);
      if (message) this.ts.error(message, 'Error');
      else this.ts.error('Error al enviar la notificación', 'Error');
    }
  }

  signPdf() {
    this.dialog.open(SignPdfComponent, {
      width: '80%',
    });
  }
}
