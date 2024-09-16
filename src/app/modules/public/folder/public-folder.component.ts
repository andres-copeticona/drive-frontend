import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatButtonModule } from '@angular/material/button';
import { FilesService } from '@app/modules/files/services/files.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Folder } from '@app/modules/files/models/folder.model';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {
  MatButtonToggleChange,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';
import { ListItemComponent } from '@app/modules/files/components/item/item.component';
import { ItemList } from '@app/modules/files/models/item.model';
import { FileModel } from '@app/modules/files/models/file.model';
import { FolderService } from '@app/modules/files/services/folder.service';
import { HttpParams } from '@angular/common/http';
import { ShareFileService } from '@app/modules/files/services/share-file.service';
import { ACCESS_TYPES } from '@app/shared/constants/constants';

@Component({
  selector: 'app-public-folder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatButtonToggleModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,

    ListItemComponent,
    NgxExtendedPdfViewerModule,
  ],
  templateUrl: './public-folder.component.html',
  styleUrl: './public-folder.component.css',
})
export class PublicFolderComponent implements OnInit {
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

  folder?: Folder;

  itemsFolders: ItemList[] = [];
  itemsFiles: ItemList[] = [];
  filteredFolders = signal<ItemList[]>([]);
  filteredFiles = signal<ItemList[]>([]);

  folders: Folder[] = [];
  files: FileModel[] = [];

  currentFolder?: Folder;

  breadcrumbs: Folder[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private folderService: FolderService,
    private fileService: FilesService,
    private ts: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId))
      this.route.params.subscribe((params) => {
        if (params['code']) {
          this.loadFolder(params['code']);
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  async load() {
    this.isLoading = true;
    await this.loadFolders();
    await this.loadFiles();
    this.isLoading = false;
  }

  async loadFolders() {
    if (!this.currentFolder) return;
    try {
      const res = await this.folderService.getPublics({
        params: new HttpParams({
          fromObject: {
            parentId: this.currentFolder.id,
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
      const files = await this.fileService.getPublics({
        params: new HttpParams({
          fromObject: { parentId: this.currentFolder.id },
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

  async loadFolder(code: string) {
    try {
      const res = await this.folderService.getPublicByCode(code);
      this.folder = res.data;
      this.currentFolder = this.folder;
      this.load();
    } catch (error) {
      console.error(error);
      this.ts.error('Ocurrió un error al cargar la carpeta');
      this.router.navigate(['/']);
    }
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

  onBreadcrumbClick(folder?: Folder) {
    if (!folder) {
      this.currentFolder = this.folder;
      this.breadcrumbs = [];
      this.load();
      return;
    }

    const index = this.breadcrumbs.findIndex((f) => f.id === folder.id);
    if (index === -1) return;
    this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
    this.currentFolder = folder;
    this.load();
  }

  async openFolder(item: ItemList) {
    const folder = this.folders.find((f) => f.id === parseInt(item.id));
    if (!folder) return;
    this.breadcrumbs.push(folder);
    this.currentFolder = folder;
    this.load();
  }

  // download() {
  //   if (!this.file?.code) return;
  //   this.fileService.publicDownload(this.file);
  // }
}
