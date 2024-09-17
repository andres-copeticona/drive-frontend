import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TruncatePipe } from '../../truncate.pipe';
import { TruncateDocumentNamePipe } from '../../pipes/truncate-document-name.pipe';
import { CdkMenu, CdkMenuItem, CdkContextMenuTrigger } from '@angular/cdk/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { ItemList } from '../files/models/item.model';
import { Folder } from '../files/models/folder.model';
import { FileModel } from '../files/models/file.model';
import { FilesService } from '../files/services/files.service';
import { AuthService } from '@app/shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FolderService } from '../files/services/folder.service';
import { HttpParams } from '@angular/common/http';
import { ACCESS_TYPES, SORT_DIR } from '@app/shared/constants/constants';
import {
  MatButtonToggleChange,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ListItemComponent } from '../files/components/item/item.component';
import { ShareFolder } from '../files/models/share-folder.model';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ShareFolderService } from '../files/services/share-folder.service';
import { User } from '@app/shared/models/user.model';

export interface DialogData {
  id: number;
  name: string;
}

@Component({
  selector: 'app-share-files',
  standalone: true,
  imports: [
    CommonModule,

    MatExpansionModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule,
    MatDividerModule,
    MatGridListModule,
    CdkContextMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    RouterModule,
    AsyncPipe,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    TruncatePipe,
    TruncateDocumentNamePipe,

    MatToolbarModule,
    MatButtonToggleModule,
    MatSidenavModule,

    ListItemComponent,
  ],
  templateUrl: './share-folder.component.html',
  styleUrl: './share-folder.component.css',
})
export class ShareFolderComponent implements OnInit {
  isLoading = false;
  searchTerm = '';

  userSelected = -1;
  dependencySelected = '';

  search() {
    if (this.searchTerm === '') {
      this.filteredFolders.set(this.itemsFolders);
      this.filteredFiles.set(this.itemsFiles);
    } else {
      const folders = this.itemsFolders.filter((i) =>
        i.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
      const items = this.itemsFiles.filter((i) =>
        i.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
      this.filteredFiles.set(items);
      this.filteredFolders.set(folders);
    }
  }

  roleId = this.authService.getInfo()?.roleId;

  searchSharedFolderTerm = '';
  sharedFolders: ShareFolder[] = [];
  itemsSharedFolders: ItemList[] = [];
  filteredSharedFolders = signal<ItemList[]>([]);

  searchSharedFolder() {
    let folders = this.sharedFolders;
    if (Number(this.userSelected) != -1) {
      folders = this.sharedFolders.filter(
        (f) => f.emisor.id == this.userSelected,
      );
    }

    if (!(this.searchSharedFolderTerm === ''))
      folders = folders.filter((f) =>
        f.folder.name
          .toLowerCase()
          .includes(this.searchSharedFolderTerm.toLowerCase()),
      );

    if (this.dependencySelected && this.dependencySelected !== '')
      folders = folders.filter(
        (f) =>
          f.emisor.dependence.toLowerCase() ==
          this.dependencySelected.toLowerCase(),
      );

    this.filteredSharedFolders.set(folders.map((f) => this.toItem(f.folder)));
  }

  itemsFolders: ItemList[] = [];
  itemsFiles: ItemList[] = [];
  filteredFolders = signal<ItemList[]>([]);
  filteredFiles = signal<ItemList[]>([]);

  users: User[] = [];
  dependencies: string[] = [];

  folders: Folder[] = [];
  files: FileModel[] = [];

  currentFolder?: Folder;

  breadcrumbs: Folder[] = [];

  constructor(
    private sharedFolderService: ShareFolderService,
    private folderService: FolderService,
    private fileService: FilesService,
    private authService: AuthService,
    private ts: ToastrService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  async load() {
    this.isLoading = true;
    this.loadSharedFiles();
    this.isLoading = false;
  }

  async loadSharedFiles() {
    try {
      const res = await this.sharedFolderService.findMany({
        params: new HttpParams({
          fromObject: {
            receptorId: this.authService.getInfo()?.userId?.toString() ?? '',
            sortDirection: SORT_DIR.DESC,
          },
        }),
      });

      this.sharedFolders = res.data?.data ?? [];
      this.itemsSharedFolders = this.sharedFolders.map((f) =>
        this.toItem(f.folder),
      );
      this.filteredSharedFolders.set(this.itemsSharedFolders);
      this.users = res.data?.data?.map((f) => f.emisor) ?? [];
      this.users = Array.from(
        new Set(this.users.map((u) => JSON.stringify(u))),
      ).map((u) => JSON.parse(u));
      this.dependencies = Array.from(
        new Set(this.users.map((f) => f.dependence)),
      );
    } catch (error) {}
  }

  async loadFolders() {
    try {
      const res = await this.folderService.findMany({
        params: new HttpParams({
          fromObject: {
            parentId: this.currentFolder?.id ?? 0,
            createdBy: this.authService.getInfo()?.userId?.toString() ?? '',
          },
        }),
      });
      this.folders = res.data?.data ?? [];
      const items = this.folders.map((f) => this.toItem(f));

      this.itemsFolders = items;
      this.filteredFolders.set(this.itemsFolders);
    } catch (error) {
      console.error(error);
      this.ts.error('No se pudo cargar la lista de archivos', 'Error');
    }
  }

  async loadFiles() {
    try {
      if (!this.currentFolder?.id) return;
      const files = await this.fileService.findMany({
        params: new HttpParams({
          fromObject: { parentId: this.currentFolder?.id },
        }),
      });
      this.files = files.data?.data ?? [];

      this.itemsFiles = this.files.map(this.toItem.bind(this));
      this.filteredFiles.set(this.itemsFiles);
    } catch (error) {
      console.error(error);
      this.ts.error('No se pudo cargar la lista de archivos', 'Error');
    }
  }

  async openSharedFolder(item: ItemList) {
    const folder = this.sharedFolders.find(
      (f) => f.folder.id === parseInt(item.id),
    );
    if (!folder) return;
    this.breadcrumbs = [];
    this.breadcrumbs.push(folder.folder);
    this.currentFolder = folder.folder;

    await this.loadFolders();
    await this.loadFiles();
  }

  async openFolder(item: ItemList) {
    const folder = this.folders.find((f) => f.id === parseInt(item.id));
    if (!folder) return;
    this.breadcrumbs.push(folder);
    this.currentFolder = folder;
    await this.loadFolders();
    await this.loadFiles();
  }

  async onBreadcrumbClick(folder?: Folder) {
    if (!folder) {
      this.currentFolder = undefined;
      this.breadcrumbs = [];
      this.filteredFolders.set([]);
      this.filteredFiles.set([]);
      return;
    }

    const index = this.breadcrumbs.findIndex((f) => f.id === folder.id);
    if (index === -1) return;
    this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
    this.currentFolder = folder;
    await this.loadFolders();
    await this.loadFiles();
  }

  toItem(item: any): ItemList {
    const name = item.name ?? item.title;
    const type = item.fileType ?? 'folder';
    const accessType = item.accessType ?? ACCESS_TYPES.PUBLIC;
    let icon = 'folder';

    if (item.fileType) {
      icon = 'picture_as_pdf';
      if (item.fileType.includes('image')) icon = 'image';
      else if (item.fileType.includes('video')) icon = 'movie';
      else if (item.fileType.includes('audio')) icon = 'graphic_eq';
      else if (item.fileType.includes('audio')) icon = 'graphic_eq';
    }

    return {
      id: item.id.toString(),
      name,
      accessType,
      code: item.code,
      type,
      icon,
    };
  }

  viewType = signal<'inline' | 'grid'>('inline');

  onChangeView(event: MatButtonToggleChange) {
    this.viewType.set(event.value);
  }
}
