import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '@app/shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FolderService } from '../../services/folder.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { ListItemComponent } from '../item/item.component';
import { FormsModule } from '@angular/forms';
import { Folder } from '../../models/folder.model';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ItemList } from '../../models/item.model';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FolderFormComponent } from '../folder-form/folder-form.component';
import { MatMenuModule } from '@angular/material/menu';
import { FileFormComponent } from '../file-form/file-form.component';
import { FilesService } from '../../services/files.service';
import { FileModel } from '../../models/file.model';
import { ACCESS_TYPES } from '@app/shared/constants/constants';
import {
  MatButtonToggleChange,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-folders',
  standalone: true,
  imports: [
    CdkContextMenuTrigger,
    CdkMenu,
    CdkMenuItem,

    MatButtonToggleModule,
    MatMenuModule,
    MatToolbarModule,
    MatGridListModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,

    CommonModule,
    FormsModule,

    ListItemComponent,
  ],
  templateUrl: './folders.component.html',
  styleUrl: './folders.component.css',
})
export class FolderComponent implements OnInit {
  isLoading = false;
  searchTerm = '';

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

  itemsFolders: ItemList[] = [];
  itemsFiles: ItemList[] = [];
  filteredFolders = signal<ItemList[]>([]);
  filteredFiles = signal<ItemList[]>([]);

  folders: Folder[] = [];
  files: FileModel[] = [];

  currentFolder?: Folder;

  breadcrumbs: Folder[] = [];

  constructor(
    private folderService: FolderService,
    private fileService: FilesService,
    private authService: AuthService,
    private ts: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const folderId = params['folder'];
      if (folderId) {
        this.currentFolder = { id: parseInt(folderId) } as any;
        this.folderService.getBreadcrumb(folderId).then((res) => {
          this.breadcrumbs = res.data ?? [];
        });
      } else {
        this.currentFolder = undefined;
        this.breadcrumbs = [];
      }

      this.load();
    });

    this.load();
  }

  async load() {
    this.isLoading = true;
    await this.loadFolders();
    await this.loadFiles();
    this.isLoading = false;
  }

  async loadFolders() {
    try {
      const res = await this.folderService.findMany({
        params: new HttpParams({
          fromObject: {
            parentId: this.currentFolder?.id ?? 0,
            createdBy: this.authService.getInfo()?.userId?.toString() ?? '',
            showAll: true,
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
          fromObject: { parentId: this.currentFolder?.id, showAll: true },
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

  async createFolder() {
    const ref = this.dialog.open(FolderFormComponent, {
      data: { parentId: this.currentFolder?.id },
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.load();
    });
  }

  async uploadFile() {
    const ref = this.dialog.open(FileFormComponent, {
      data: { parentId: this.currentFolder?.id },
      minWidth: '400px',
      maxWidth: '90%',
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.load();
    });
  }

  async openFolder(item: ItemList) {
    const folder = this.folders.find((f) => f.id === parseInt(item.id));
    if (!folder) return;
    this.breadcrumbs.push(folder);
    this.currentFolder = folder;
    this.router.navigate(['/nube/carpetas'], {
      queryParams: { folder: folder.id },
    });
    this.load();
  }

  onBreadcrumbClick(folder?: Folder) {
    if (!folder) {
      this.currentFolder = undefined;
      this.breadcrumbs = [];
      this.router.navigate(['/nube/carpetas']);
      this.load();
      return;
    }

    const index = this.breadcrumbs.findIndex((f) => f.id === folder.id);
    if (index === -1) return;
    this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
    this.currentFolder = folder;
    this.router.navigate(['/nube/carpetas'], {
      queryParams: { folder: folder.id },
    });
    this.load();
  }

  goBack() {
    this.onBreadcrumbClick(this.breadcrumbs[this.breadcrumbs.length - 2]);
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
