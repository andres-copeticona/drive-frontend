import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DatePipe } from '@angular/common';
import { FormatDatePipe } from '@app/pipes/format-date.pipe';
import { Activity } from '../../models/activity.model';
import { ActivityService } from '../../services/activity.service';
import { PaginatorIntl } from '@app/shared/components/paginator-intl/paginator-intl.component';
import { HttpParams } from '@angular/common/http';
import { ACCESS_TYPES, SORT_DIR } from '@app/shared/constants/constants';
import { MatTabsModule } from '@angular/material/tabs';
import { FolderService } from '@app/modules/files/services/folder.service';
import { Folder } from '@app/modules/files/models/folder.model';
import { FilesService } from '@app/modules/files/services/files.service';
import { FileModel } from '@app/modules/files/models/file.model';
import { QrService } from '@app/shared/services/qr.service';
import { QrCodeData } from '@app/modules/details-qr/models/qr-code-data';

@Component({
  selector: 'app-activitycenter',
  host: { ngSkipHydratation: 'true' },
  standalone: true,
  imports: [
    DatePipe,
    FormatDatePipe,
    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatTabsModule,
    MatPaginatorModule,
  ],
  templateUrl: './activitycenter.component.html',
  styleUrl: './activitycenter.component.css',
  providers: [{ provide: MatPaginatorIntl, useClass: PaginatorIntl }],
})
export class ActivityCenterComponent implements OnInit, AfterViewInit {
  userList: Activity[] = [];
  userSearchControl = new FormControl('');
  userDataSource = new MatTableDataSource<Activity>();
  userColumns: string[] = [
    'userId',
    'fullname',
    'date',
    'ip',
    'activityType',
    'description',
  ];
  @ViewChild('userPaginator') userPaginator!: MatPaginator;
  userTotals = 0;
  userFilter = {
    searchTerm: '',
    page: 0,
    size: 5,
    sortDirection: SORT_DIR.DESC,
  };

  async onUserPage(event: PageEvent) {
    this.userFilter.page = event.pageIndex;
    this.userFilter.size = event.pageSize;
    await this.loadUsersActivities();
  }

  sharedSearchControl = new FormControl('');
  sharedDataSource = new MatTableDataSource<Folder>();
  sharedActivityColumns: string[] = ['id', 'name', 'code', 'quantity'];
  @ViewChild('sharedPaginator') sharedPaginator!: MatPaginator;
  sharedFilter = {
    searchTerm: '',
    page: 0,
    size: 5,
    accessType: ACCESS_TYPES.PUBLIC,
    sortDirection: SORT_DIR.DESC,
  };

  onSharedPage(event: PageEvent) {
    this.sharedFilter.page = event.pageIndex;
    this.sharedFilter.size = event.pageSize;
    this.loadShared();
  }

  constructor(
    public activityService: ActivityService,
    public folderService: FolderService,
    public fileService: FilesService,
    public qrService: QrService,
  ) {
    this.userSearchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.userFilter.searchTerm = value!;
        this.userPaginator.firstPage();
        this.loadUsersActivities();
      });

    this.sharedSearchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.sharedFilter.searchTerm = value!;
        this.sharedPaginator.firstPage();
        this.loadShared();
      });

    this.fileSearchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.fileFilter.searchTerm = value!;
        this.filePaginator.firstPage();
        this.loadFiles();
      });

    this.qrSearchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.qrFilter.searchTerm = value!;
        this.qrPaginator.firstPage();
        this.loadqrs();
      });
  }

  async ngAfterViewInit() {
    await this.loadUsersActivities();
    await this.loadShared();
    await this.loadFiles();
    await this.loadqrs();
  }

  async ngOnInit() {}

  async loadUsersActivities() {
    const res = await this.activityService.findMany({
      params: new HttpParams({ fromObject: this.userFilter }),
    });
    this.userDataSource.data = res.data.data;
    this.userPaginator.length = res.data.total;
  }

  async loadShared() {
    const res = await this.folderService.findMany({
      params: new HttpParams({
        fromObject: this.sharedFilter,
      }),
    });
    this.sharedDataSource.data = res.data.data;
    this.sharedPaginator.length = res.data.total;
  }

  fileSearchControl = new FormControl('');
  fileDataSource = new MatTableDataSource<FileModel>();
  fileActivityColumns: string[] = ['id', 'name', 'code', 'quantity'];
  @ViewChild('filePaginator') filePaginator!: MatPaginator;
  fileFilter = {
    searchTerm: '',
    page: 0,
    size: 5,
    accessType: ACCESS_TYPES.PUBLIC,
    sortDirection: SORT_DIR.DESC,
    category: 'Nuevo',
  };

  onFilePage(event: PageEvent) {
    this.fileFilter.page = event.pageIndex;
    this.fileFilter.size = event.pageSize;
    this.loadFiles();
  }

  async loadFiles() {
    const res = await this.fileService.findMany({
      params: new HttpParams({
        fromObject: this.fileFilter,
      }),
    });
    this.fileDataSource.data = res.data.data;
    this.filePaginator.length = res.data.total;
  }

  qrSearchControl = new FormControl('');
  qrDataSource = new MatTableDataSource<QrCodeData>();
  qrActivityColumns: string[] = ['id', 'name', 'title', 'code', 'quantity'];
  @ViewChild('qrPaginator') qrPaginator!: MatPaginator;
  qrFilter = {
    searchTerm: '',
    page: 0,
    size: 5,
    sortDirection: SORT_DIR.DESC,
  };

  onQrPage(event: PageEvent) {
    this.qrFilter.page = event.pageIndex;
    this.qrFilter.size = event.pageSize;
    this.loadqrs();
  }

  async loadqrs() {
    const res = await this.qrService.findMany({
      params: new HttpParams({
        fromObject: this.qrFilter,
      }),
    });
    this.qrDataSource.data = res.data.data;
    this.qrPaginator.length = res.data.total;
  }
}
