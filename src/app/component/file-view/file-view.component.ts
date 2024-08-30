import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable, async, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { ModelfolderComponent } from '../modelfolder/modelfolder.component';
import { read } from 'fs';
import { FolderService } from '../../service/folder.service';
import { TruncateDocumentNamePipe } from "../../pipes/truncate-document-name.pipe";

@Component({
    selector: 'app-file-view',
    standalone: true,
    templateUrl: './file-view.component.html',
    styleUrl: './file-view.component.css',
    imports: [RouterModule, AsyncPipe, MatCardModule, MatButtonModule, MatMenuModule, MatIconModule, MatTooltipModule, MatProgressBarModule, TruncateDocumentNamePipe]
})
export class FileViewComponent {
  backgroundColor = '#6663FE'; // Color inicial
  constructor(public dialog: MatDialog,public folderService: FolderService) {}
  ngAfterViewInit(): void {

  }
  colors!: string[];
  selectedFolder!: number;
  folderList$!: Observable<any[]>;
  fileList$!: Observable<any[]>;
  ngOnInit(): void {
    this.folderList$ = of([]);
    this.folderService.getAllFolders().subscribe(
      response => {
        this.folderList$.subscribe(() => {
          this.folderList$ = of(response.data);
        });

        // Manejar la respuesta de éxito aquí
        console.log('Registros de folders', response.data.length);
        this.folderList$.subscribe((folderList) => {

          console.log(folderList[0]);
        });
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar folders', error);
      }
    )
    this.colors = [];
    this.selectedFolder = 0;
    this.fileList$ = of([
      {id:1, name: 'File 1.mp3', category: 'Audio', size: '3.5 MB', folderId: 2},
      {id:2, name: 'File 2.jpg', category: 'Pictures', size: '2.5 MB', folderId: 2},
      {id:3, name: 'File 3.png', category: 'Documents', size: '1.5 MB', folderId: 3},
      {id:4, name: 'File 4.mp3', category: 'Audio', size: '3.5 MB', folderId: 4},
    ]);
    this.folderList$.subscribe((folderList) => {
      for (let i = 0; i < folderList.length; i++) {
        this.colors[i]=this.backgroundColor;
      }
    });
  }
  openDialog() {
    this.dialog.open(ModelfolderComponent, {
      data: {
      },
    });
  }

  selectfolder(folder: any) {
    this.folderList$.subscribe((folderList) => {
      for (let i = 0; i < folderList.length; i++) {
        this.colors[i]=this.backgroundColor;
      }
    });
    this.colors[folder-1]="#b1b0f5";
    this.selectedFolder = folder;
    console.log(this.selectedFolder);
  }
}
