import { Component, OnInit, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TruncatePipe } from '../../truncate.pipe';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { TruncateDocumentNamePipe } from '../../pipes/truncate-document-name.pipe';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { MatListModule } from '@angular/material/list';

import { FileModel } from '../files/models/file.model';
import {
  MatPaginator,
  MatPaginatorIntl,
  PageEvent,
} from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ShareFile } from '../files/models/share-file.model';
import { ShareFileService } from '../files/services/share-file.service';
import { HttpParams } from '@angular/common/http';
import { AuthService } from '@app/shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FilesService } from '../files/services/files.service';
import { PreviewComponent } from '../files/components/preview/preview.component';
import { ItemList } from '../files/models/item.model';
import { ACCESS_TYPES } from '@app/shared/constants/constants';
import { CheckPasswordDialogComponent } from '@app/shared/components/check-password-dialog/check-password-dialog.component';
import { PaginatorIntl } from '@app/shared/components/paginator-intl/paginator-intl.component';

@Component({
  selector: 'app-shared-files',
  standalone: true,
  templateUrl: './shared-files.component.html',
  styleUrl: './shared-files.component.css',
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
    MatTableModule,
    MatPaginator,
    TruncateDocumentNamePipe,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: PaginatorIntl }],
})
export class SharedFilesComponent implements OnInit {
  search = '';
  files: ShareFile[] = [];

  displayedColumns: string[] = [
    'name',
    'emitter',
    'receptor',
    'sharedAt',
    'actions',
  ];
  dataSource: MatTableDataSource<ShareFile> = new MatTableDataSource([] as any);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filters = {
    searchTerm: '',
    page: 0,
    size: 10,
  };

  constructor(
    private authService: AuthService,
    private shareFileService: ShareFileService,
    private fileService: FilesService,
    private dialog: MatDialog,
    private ts: ToastrService,
  ) {}

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.loadSharedFiles();
  }

  async loadSharedFiles() {
    try {
      const res = await this.shareFileService.findMany({
        params: new HttpParams({
          fromObject: {
            ...this.filters,
            receptorId: this.authService.getInfo()?.userId!,
          },
        }),
      });

      this.dataSource.data = res.data.data;
      this.paginator.length = res.data.total;
    } catch (error: any) {
      console.error(error);
      const msg =
        error.error?.message || 'Error al cargar los archivos compartidos';
      this.ts.error(msg, 'Error');
    }
  }

  onPageChange(event: PageEvent) {
    this.filters.page = event.pageIndex;
    this.filters.size = event.pageSize;
    this.loadSharedFiles();
  }

  onSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filters.searchTerm = filterValue.trim().toLowerCase();
    this.loadSharedFiles();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
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

  preview(file: FileModel) {
    const item = this.toItem(file);

    if (file.accessType == ACCESS_TYPES.RESTRICTED) {
      const ref = this.dialog.open(CheckPasswordDialogComponent, {
        data: { id: file.id, service: this.fileService },
      });

      ref.afterClosed().subscribe((result) => {
        if (result)
          this.dialog.open(PreviewComponent, {
            data: { item },
          });
      });
    } else {
      this.dialog.open(PreviewComponent, {
        data: { item },
      });
    }
  }

  download(file: FileModel) {
    this.fileService.download(file);
  }
}
