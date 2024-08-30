import { Component, OnInit } from '@angular/core';
import { Observable, async, map, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
import { UsuarioService } from '../../service/usuario.service';
import { FileService } from '../../service/file.service';
import { TruncatePipe } from "../../truncate.pipe";
import { TruncateDocumentNamePipe } from "../../pipes/truncate-document-name.pipe";
import { ModelimgComponent } from '../modelimg/modelimg.component';
import { ModelsharingComponent } from '../modelsharing/modelsharing.component';
import { ModelpdfComponent } from '../modelpdf/modelpdf.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthServiceService } from '../../service/auth-service.service';
import { ModelpasswordComponent } from '../modelpassword/modelpassword.component';
import { ModelsharefolderComponent } from '../modelsharefolder/modelsharefolder.component';
import { ModelaudioComponent } from '../modelaudio/modelaudio.component';
import { ModelvideoComponent } from '../modelvideo/modelvideo.component';
import { CdkMenu, CdkMenuItem, CdkContextMenuTrigger } from '@angular/cdk/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { ModeldeleteComponent } from '../modeldelete/modeldelete.component';

import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';

import { ChangeDetectionStrategy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Renderer2, ElementRef } from '@angular/core';

export interface DialogData {
  id: number;
  name: string;
}

export interface Section {
  name: string;
  updated: Date;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatDividerModule, DatePipe, MatListModule, MatGridListModule, CdkContextMenuTrigger, CdkMenu, CdkMenuItem, RouterModule, AsyncPipe, MatCardModule, MatButtonModule, MatMenuModule, MatIconModule, MatTooltipModule, MatProgressBarModule, TruncatePipe, TruncateDocumentNamePipe]
})
export class FavoritesComponent implements OnInit {

  //buscador
  searchTerm: string = '';
  filteredFolders$!: Observable<any[]>;
  filteredFoldersmobil$!: Observable<any[]>;


  searchTermsub: string = '';
  filteredFolderssub$!: Observable<any[]>;
  searchTermfiles: string = '';
  filteredFoldersfiles$!: Observable<any[]>;


  userList$!: Observable<any[]>;
  rol: any;
  backgroundColorShared = '#00A0B6'; // Color inicial shared
  backgroundColor = 'white'; // Color inicial
  constructor(
    private renderer: Renderer2, private el: ElementRef, public usuarioService: UsuarioService, private route: ActivatedRoute, private authService: AuthServiceService, private router: Router, private fileService: FileService, public dialog: MatDialog, public folderService: FolderService) { }
  colors!: string[];
  selectedFolder!: number;
  parentSelectedFolder!: number;
  parentSharedSelectedFolder!: number;
  parentSharedSelectedFolderName!: string;
  parentSelectedFolderName!: string;
  childSelectedFolder!: number;
  routechild!: any[];
  routesharedchild!: any[];
  foldername!: string;
  folderList$!: Observable<any[]>;
  folderListmobile$!: Observable<any[]>;
  subfolderList$!: any[];
  subfolderListmobil$!: any[];
  fileList$!: Observable<any[]>;
  subfoldersList$!: Observable<any[]>;
  trigger: number = 0;
  useridglobal: any;
  //for shared folders
  selectedSharedFolder!: number;
  colorsshared!: string[];
  sharedFolders$!: Observable<any[]>;
  sharedSubFolders$!: Observable<any[]>;
  sharedSubFoldersList$!: any[];
  sharedFiles$!: Observable<any[]>;

  userId: any;
  ngOnInit(): void {
    this.filteredFolders$ = this.folderList$;
    this.filteredFoldersmobil$ = this.folderListmobile$;
    this.userList$ = of([]);
    this.useridglobal = this.authService.obtenerIdUsuario();
    this.route.queryParams.subscribe(params => {
      this.trigger = params['number'];
      if (this.trigger == 1) {
        this.actualizarListasDelete();
        this.trigger = 0;
      }
      if (this.trigger == 2) {
        this.actualizarListas();
        this.trigger = 0;
      }

    });
    this.userId = this.authService.obtenerIdUsuario();
    this.subfolderList$ = [
    ];
    this.subfolderListmobil$ = [
    ];
    this.colors = [];
    this.colorsshared = [];
    this.folderList$ = of([]);
    this.actualizarListas();
    this.iniciarmobil();

    this.selectedFolder = 0;
    this.selectedSharedFolder = 0;
    this.foldername = '';

    this.sharedFiles$ = of([]);
    this.sharedFolders$ = of([]);
    this.sharedSubFolders$ = of([]);
    this.listarsharedfolders(this.userId);
    this.obtenerusers();

  }

  // Método para mostrar un mensaje de éxito al eliminar un archivo
  obtenerusers() {
    const userId = this.authService.obtenerIdUsuario();
    this.usuarioService.getAllUsers().subscribe(
      response => {
        this.userList$.subscribe(() => {
          this.userList$ = of(response.data.content);
          for (let i = 0; i < response.data.content.length; i++) {
            if (response.data.content[i].usuarioID == userId) {
              console.log('Rol del user', response.data.content[i].roles[0].rolID);
              this.rol = response.data.content[i].roles[0].rolID;
            }
          }
        });
        // Manejar la respuesta de éxito aquí
        console.log('Registros de usuarios', response.data.content[0].nombre);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar usuarios', error);
      }
    )
  }

  // para compartir el folder
  sharefolder(idfolder: number, idperson: number, name: string) {
    this.router.navigate(['/cloud/favorites']);
    this.dialog.open(ModelsharefolderComponent, {
      data: {
        id: idfolder,
        iduser: this.userId,
        idperson: idperson,
        name: name
      },
    });
  }

  // la lista de los documento s compartidos
  listarsharedfolders(id: any) {
    this.folderService.listSharedFolders(id).subscribe(
      response => {
        this.sharedFolders$ = of(response.data);
        // Manejar la respuesta de éxito aquí
        console.log('Registros de sharedfolders', response, ' user:');
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar sharedfolders', error);
      }
    )
  }

  // contenido de los documentos compartidos con su contenido
  listarsharedfolderscontent(id: any) {
    if (this.selectedSharedFolder != 0) {
      this.folderService.listSharedFolderContents(id, this.selectedSharedFolder).subscribe(
        response => {
          this.sharedFiles$ = of(response.data.files);
          this.sharedSubFolders$ = of(response.data.folders);
          // Manejar la respuesta de éxito aquí
          console.log('Registros de sharedContentfolders', response, ' user:');
        },
        error => {
          // Manejar el error aquí
          console.error('Error al mostrar sharedContentfolders', error);
        }
      )
    }
  }

  //iniciar folders para mobil
  iniciarmobil() {

    this.folderService.getAllFolders().subscribe(
      response => {
        this.folderList$.subscribe(() => {
          this.folderList$ = of(response.data);
          this.folderListmobile$ = of(response.data);

          this.filteredFoldersmobil$ = this.folderListmobile$;
        });
        // Manejar la respuesta de éxito aquí
        console.log('Registros de folders', response.data, ' user:');
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar folders', error);
      }
    )
  }

  // metodo para actualizar la lista de los documentos
  actualizarListas() {
    console.log("entro a actualizar listas");
    this.subfolderList$ = [];
    this.subfolderListmobil$ = [];
    this.folderService.getAllFolders().subscribe(
      response => {
        this.folderList$.subscribe(() => {
          this.folderList$ = of(response.data);
          this.filteredFolders$ = this.folderList$;
          //this.filteredFoldersmobil$ = this.folderList$;
        });
        // Manejar la respuesta de éxito aquí
        console.log('Registros de folders', response.data, ' user:');
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar folders', error);
      }
    )
    setTimeout(() => {
      this.fileService.listFilesByUserAndFolder(this.selectedFolder).subscribe(
        response => {
          this.fileList$ = of(response.files);
          this.subfoldersList$ = of(response.folders);
          // Manejar la respuesta de éxito aquí
          console.log('Registros de files fui a actualizar', response.files, response);
        },
        error => {
          // Manejar el error aquí
          console.error('Error al mostrar files  fui a actualizar', error);
        }

      )
      if(this.selectedFolder){
        this.fileService.listFilesByUserAndFolder(this.selectedFolder).subscribe(
          response => {
            this.fileList$ = of(response.files);
            this.folderListmobile$ = of(response.folders);
            this.filteredFoldersmobil$ = this.folderListmobile$;
            this.filteredFoldersfiles$ = this.fileList$;
            this.filteredFolderssub$ = this.subfoldersList$;
            // Manejar la respuesta de éxito aquí
            console.log('Registros de files', response.files, response);
          },
          error => {
            // Manejar el error aquí
            console.error('Error al mostrar files', error);
          }

        )

      }else{
        this.iniciarmobil();
      }
    }, 500);
    setTimeout(() => {
      this.folderList$.subscribe((folderList) => {
        console.log("id es:" + folderList[folderList.length - 1].id, "son:" + folderList.length);
        for (let i = 0; i < folderList[folderList.length - 1].id; i++) {
          this.colors[i] = this.backgroundColor;
        }
      });
    }, 1000);

    setTimeout(() => {
      this.listarsharedfolders(this.userId);
      this.listarsharedfolderscontent(this.userId);
    }, 500);
    setTimeout(() => {
      this.sharedFolders$.subscribe((folderList) => {
        console.log("id es:" + folderList[folderList.length - 1].id, "son:" + folderList.length);
        for (let i = 0; i < folderList[folderList.length - 1].id; i++) {
          this.colorsshared[i] = this.backgroundColorShared;
        }
      });
    }, 1000);
  }

  // metodo para actualizar la lista de los documentos cuando eliminamos
  actualizarListasDelete() {
    console.log("entro a actualizar listas");
    this.routechild = [];
    this.subfolderList$ = [];
    this.subfolderListmobil$ = [];
    this.selectedFolder = 0;
    this.folderListmobile$ = of([]);
    this.folderService.getAllFolders().subscribe(
      response => {
        this.folderList$.subscribe(() => {
          this.folderList$ = of(response.data);
          this.folderListmobile$ = of(response.data);
          this.filteredFolders$ = this.folderList$;
          this.filteredFoldersmobil$ = this.folderListmobile$;
        });
        // Manejar la respuesta de éxito aquí
        console.log('Registros de folders luego de actualizar', response.data, ' user:');
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar folders', error);
      }
    )
  }
  // metodo para abrir el dialogo de los documentos
  openDialogpasswordimg(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
    this.dialog.open(ModelpasswordComponent, {
      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: privacy,
        iduser: iduser,
        description: description,
        accessType: accessType,
        password: password,
        categoria: "img",
        folderId: folderId
      },
    });
  }
  // metodo para abrir el dialogo de los documentos
  openDialogpassworddoc(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
    this.dialog.open(ModelpasswordComponent, {
      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: privacy,
        iduser: iduser,
        description: categoria,
        accessType: accessType,
        password: password,
        categoria: "doc",
        folderId: folderId
      },
    });
  }

  // metodo para abrir el dialogo de los documentos
  openDialogpassworddelete(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {

    this.router.navigate(['/cloud/favorites']);
    this.dialog.open(ModelpasswordComponent, {
      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: privacy,
        iduser: iduser,
        description: description,
        accessType: accessType,
        password: password,
        categoria: "delete",
        folderId: folderId
      },
    });
  }

  // metodo para abrir el dialogo de los documentos
  openDialogpasswordshare(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
    this.dialog.open(ModelpasswordComponent, {
      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: privacy,
        iduser: iduser,
        description: description,
        accessType: accessType,
        password: password,
        categoria: "share",
        folderId: folderId
      },
    });
  }

  // metodo para abrir el dialogo de los documentos
  openDialogempty() {
    this.router.navigate(['/cloud/favorites']);
    this.dialog.open(ModelfolderComponent, {
      data: {
      },
    });
  }

  // metodo para descargar el folder
  downloadFolder(foldername: string) {
    const fileUrl = foldername; // URL de tu backend donde se encuentra el archivo ZIP

    this.folderService.downloadFile(fileUrl).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = foldername+'.zip'; // Nombre del archivo a descargar
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error('Error al descargar el archivo:', error);
    });
  }

  // metodo para abrir el dialogo de los documentos
  openDialog() {
    this.router.navigate(['/cloud/favorites']);
    this.dialog.open(ModelfolderComponent, {
      data: {
        id: this.selectedFolder,
        name: this.foldername
      },
    });
  }

  // metodo para abrir el dialogo de los documentos
  openDialogparent(idfolder: number, namefolder: string) {
    this.router.navigate(['/cloud/favorites']);
    this.dialog.open(ModelfolderComponent, {
      data: {
        id: idfolder,
        name: namefolder
      },
    });
  }

  // metodo para abrir el dialogo de los documentos pdf
  openDialogpdf(id: number, name: string, img: string, date: string, privacy: string, folderId: number, accessType: string, password: string, categoria: string) {
    this.dialog.open(ModelpdfComponent, {
      height: '90%',

      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: privacy,
        iduser: this.userId,
        folderId: folderId,
        accessType: accessType,
        password: password,
        categoria: categoria
      },
    });
  }

  // para eliminar el dialogo
  openDialogDelete(id: number, name: string, img: string, date: string, privacy: string, folderId: number, accessType: string, password: string) {

    this.router.navigate(['/cloud/favorites']);
    this.dialog.open(ModeldeleteComponent, {
      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: "folders",
        iduser: this.userId,
        folderId: folderId,
        accessType: accessType,
        password: password,
      },
    });
  }

  // para abrir el dialogo de la imagen y eliminar
  openDialogDeleteFolder(id: number, name: string, img: string, date: string, privacy: string, folderId: number, accessType: string, password: string) {

    this.router.navigate(['/cloud/favorites']);
    this.dialog.open(ModeldeleteComponent, {
      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: "folders",
        iduser: this.userId,
        folderId: folderId,
        accessType: accessType,
        password: "folder",
      },
    });
  }

  //
  openDialog1(id: number, name: string, img: string, date: string, privacy: string) {
    this.dialog.open(ModelimgComponent, {
      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: privacy
      },
    });
  }

  openDialogShare(id: number, name: string, img: string, date: string, privacy: string) {
    this.dialog.open(ModelsharingComponent, {
      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: privacy,
        iduser: this.userId,
      },
    });
  }
  deletefile(id: number) {
    this.fileService.deleteFile(id).subscribe({
      next: (response) => {
        console.log('File deleted successfully: ', response);
        this.actualizarListas();

      },
      error: (error) => {
        console.error('Error deleting file', error);
        this.actualizarListas();
        if (error.status == 200) { this.mostrarMensajeDeleteExito(); } else { this.mostrarMensajeDeleteError(); }
      }
    });
  }

  openDialogaudio(id: number, name: string, img: string, date: string, privacy: string) {
    this.dialog.open(ModelaudioComponent, {
      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: privacy
      },
    });
  }

  openDialogvideo(id: number, name: string, img: string, date: string, privacy: string) {
    this.dialog.open(ModelvideoComponent, {
      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: privacy
      },
    });
  }
  imprimir(objeto1: any, objeto2: any) {
    console.log("entro a imprimir:", objeto1, ";", objeto2);
  }

  selectfolder(folder: any, name: string) {
    if (this.parentSelectedFolder) {
      const previousRectangle = this.el.nativeElement.querySelector('#rectangle' + this.parentSelectedFolder);
      if (previousRectangle) {
        this.renderer.setStyle(previousRectangle, 'background-color', this.backgroundColor);
      }
    }
    // Cambiar el color del elemento con id "rectangle" a negro
    if (this.selectedFolder !== folder) {

      const rectangle = this.el.nativeElement.querySelector('#rectangle' + folder);
      if (rectangle) {
        this.renderer.setStyle(rectangle, 'background-color', '#9db8dd');
      }
      this.routechild = [];
      this.subfolderList$ = [];
      this.subfolderListmobil$ = [];
      this.folderList$.subscribe(() => {
        for (let i = 0; i < this.colors.length; i++) {
          this.colors[i] = this.backgroundColor;
        }
      });
      this.colors[folder - 1] = "#b1b0f5";
      this.selectedFolder = folder;
      this.parentSelectedFolder = folder;
      this.foldername = name;
      this.parentSelectedFolderName = name;
      console.log(this.selectedFolder);
    }else{

      const rectangle = this.el.nativeElement.querySelector('#rectangle' + folder);
      if (rectangle) {
        this.renderer.setStyle(rectangle, 'background-color', this.backgroundColor);
      }
      this.routechild = [];
      this.subfolderList$ = [];
      this.subfolderListmobil$ = [];
      this.folderList$.subscribe(() => {
        for (let i = 0; i < this.colors.length; i++) {
          this.colors[i] = this.backgroundColor;
        }
      });
      this.colors[folder - 1] = "#b1b0f5";
      this.selectedFolder = 0;
      this.parentSelectedFolder = 0;
      this.foldername = name;
      this.parentSelectedFolderName = name;
      console.log(this.selectedFolder);

    }
    //pidiendo shared folders
    //this.listarsharedfolderscontent(this.userId);
    this.fileService.listFilesByUserAndFolder(this.selectedFolder).subscribe(
      response => {
        this.fileList$ = of(response.files);
        this.subfoldersList$ = of(response.folders);
        this.filteredFoldersfiles$ = this.fileList$;
        this.filteredFolderssub$ = this.subfoldersList$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files, response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )
    this.folderList$.subscribe((folderx) => {
      for (let i = 0; i < folderx.length; i++) {
        if (folderx[i].parentFolderId == this.selectedFolder) {
          this.subfolderList$.push(folderx[i]);
          console.log('Subfolders:', this.subfolderList$);
          this.subfolderListmobil$.push(folderx[i]);
        }
      }
    });

  }
  selectfolderchild(folder: any, name: string) {
    if (!this.routechild) {
      this.routechild = [];
    }
    if (this.childSelectedFolder) {
      const previousRectangle = this.el.nativeElement.querySelector('#subrectangle' + this.childSelectedFolder);
      if (previousRectangle) {
        this.renderer.setStyle(previousRectangle, 'background-color', this.backgroundColor);
      }
    }
    // Cambiar el color del elemento con id "rectangle"
    const rectangle = this.el.nativeElement.querySelector('#subrectangle' + folder);
    if (rectangle) {
      this.renderer.setStyle(rectangle, 'background-color', '#9db8dd');
    }
    this.subfolderList$ = [];
    this.subfolderListmobil$ = [];
    this.folderList$.subscribe(() => {
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i] = this.backgroundColor;
      }
    });
    this.colors[folder - 1] = "#b1b0f5";
    this.selectedFolder = folder;
    this.routechild.push({ id: folder, namefolder: name });
    this.childSelectedFolder = folder;
    this.foldername = name;
    console.log(this.selectedFolder);
    this.fileService.listFilesByUserAndFolder(this.selectedFolder).subscribe(
      response => {
        this.fileList$ = of(response.files);
        this.subfoldersList$ = of(response.folders);
        this.filteredFoldersfiles$ = this.fileList$;
        this.filteredFolderssub$ = this.subfoldersList$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files, response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )
    this.folderList$.subscribe((folderx) => {
      for (let i = 0; i < folderx.length; i++) {
        if (folderx[i].parentFolderId == this.selectedFolder) {
          this.subfolderList$.push(folderx[i]);
          console.log('Subfolders:', this.subfolderList$);
          this.subfolderListmobil$.push(folderx[i]);
        }
      }
    });

  }

  selectfolderchildmobile(folder: any, name: string) {
    if (!this.routechild) {
      this.routechild = [];
    }
    if (this.childSelectedFolder) {
      const previousRectangle = this.el.nativeElement.querySelector('#subrectangle' + this.childSelectedFolder);
      if (previousRectangle) {
        this.renderer.setStyle(previousRectangle, 'background-color', this.backgroundColor);
      }
    }
    // Cambiar el color del elemento con id "rectangle"
    const rectangle = this.el.nativeElement.querySelector('#subrectangle' + folder);
    if (rectangle) {
      this.renderer.setStyle(rectangle, 'background-color', '#9db8dd');
    }
    this.subfolderList$ = [];
    this.subfolderListmobil$ = [];
    this.folderList$.subscribe(() => {
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i] = this.backgroundColor;
      }
    });
    this.colors[folder - 1] = "#b1b0f5";
    this.selectedFolder = folder;
    this.routechild.push({ id: folder, namefolder: name });
    this.childSelectedFolder = folder;
    this.foldername = name;
    console.log(this.selectedFolder);
    this.fileService.listFilesByUserAndFolder(this.selectedFolder).subscribe(
      response => {
        this.fileList$ = of(response.files);
        this.subfoldersList$ = of(response.folders);
        this.folderListmobile$ = of(response.folders);

        this.filteredFoldersfiles$ = this.fileList$;
        this.filteredFolders$ = this.subfoldersList$;
        this.filteredFoldersmobil$ = this.folderListmobile$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files, response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )
    this.folderList$.subscribe((folderx) => {
      for (let i = 0; i < folderx.length; i++) {
        if (folderx[i].parentFolderId == this.selectedFolder) {
          this.subfolderList$.push(folderx[i]);
          console.log('Subfolders:', this.subfolderList$);
          this.subfolderListmobil$.push(folderx[i]);
        }
      }
    });

  }

  selectfolderchildroute(folder: any, name: string) {
    this.subfolderList$ = [];
    this.folderList$.subscribe(() => {
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i] = this.backgroundColor;
      }
    });
    this.colors[folder - 1] = "#b1b0f5";
    this.selectedFolder = folder;
    this.childSelectedFolder = folder;
    this.foldername = name;
    this.routechild = this.routechild.slice(0, this.routechild.findIndex(x => x.id === folder) + 1);
    console.log(this.selectedFolder);
    this.fileService.listFilesByUserAndFolder(this.selectedFolder).subscribe(
      response => {
        this.fileList$ = of(response.files);
        this.subfoldersList$ = of(response.folders);

        this.filteredFoldersfiles$ = this.fileList$;
        this.filteredFolderssub$ = this.subfoldersList$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files, response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )
    this.folderList$.subscribe((folderx) => {
      for (let i = 0; i < folderx.length; i++) {
        if (folderx[i].parentFolderId == this.selectedFolder) {
          this.subfolderList$.push(folderx[i]);
          console.log('Subfolders:', this.subfolderList$);
          this.subfolderListmobil$.push(folderx[i]);
        }
      }
    });

  }
  selectfolderchildroutemobile(folder: any, name: string) {
    this.subfolderList$ = [];
    this.folderList$.subscribe(() => {
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i] = this.backgroundColor;
      }
    });
    this.colors[folder - 1] = "#b1b0f5";
    this.selectedFolder = folder;
    this.childSelectedFolder = folder;
    this.foldername = name;
    this.routechild = this.routechild.slice(0, this.routechild.findIndex(x => x.id === folder) + 1);
    console.log(this.selectedFolder);
    this.fileService.listFilesByUserAndFolder(this.selectedFolder).subscribe(
      response => {
        this.fileList$ = of(response.files);
        this.subfoldersList$ = of(response.folders);
        this.folderListmobile$ = of(response.folders);

        this.filteredFoldersfiles$ = this.fileList$;
        this.filteredFolders$ = this.subfoldersList$;
        this.filteredFoldersmobil$ = this.folderListmobile$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files, response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )
    this.folderList$.subscribe((folderx) => {
      for (let i = 0; i < folderx.length; i++) {
        if (folderx[i].parentFolderId == this.selectedFolder) {
          this.subfolderList$.push(folderx[i]);
          console.log('Subfolders:', this.subfolderList$);
          this.subfolderListmobil$.push(folderx[i]);
        }
      }
    });

  }


  selectsharedfolder(folder: any, name: string) {
    this.routesharedchild = [];
    this.sharedSubFoldersList$ = [];
    this.sharedFolders$.subscribe(() => {
      for (let i = 0; i < this.colorsshared.length; i++) {
        this.colorsshared[i] = this.backgroundColorShared;
      }
    });
    this.colorsshared[folder - 1] = "#61cad8";
    this.parentSharedSelectedFolder = folder;
    this.parentSharedSelectedFolderName = name;
    this.selectedSharedFolder = folder;
    console.log(this.selectedSharedFolder);
    this.folderService.listSharedFolderContents(this.userId, this.selectedSharedFolder).subscribe(
      response => {
        this.sharedFiles$ = of(response.data.files);
        this.sharedSubFolders$ = of(response.data.folders);
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.data.files, response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )

  }
  selectsharedsubfolder(folder: any, name: string, userIdsubfolder: number) {
    this.sharedSubFoldersList$ = [];
    this.sharedFolders$.subscribe(() => {
      for (let i = 0; i < this.colorsshared.length; i++) {
        this.colorsshared[i] = this.backgroundColorShared;
      }
    });
    this.colorsshared[folder - 1] = "#61cad8";
    this.selectedSharedFolder = folder;
    this.routesharedchild.push({ id: folder, namefolder: name, userId: userIdsubfolder });
    console.log(this.selectedSharedFolder);
    this.fileService.listFilesByUserAndFolderWithId(userIdsubfolder, this.selectedSharedFolder).subscribe(
      response => {
        this.sharedFiles$ = of(response.files);
        this.sharedSubFolders$ = of(response.folders);
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files, response, "folder:", this.selectedSharedFolder, "user:", this.userId);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )

  }
  selectsharedsubfolderroute(folder: any, name: string, userIdsubfolder: number) {
    console.log("entro a selectsharedsubfolderroute:", userIdsubfolder);
    this.sharedSubFoldersList$ = [];
    this.sharedFolders$.subscribe(() => {
      for (let i = 0; i < this.colorsshared.length; i++) {
        this.colorsshared[i] = this.backgroundColorShared;
      }
    });
    this.colorsshared[folder - 1] = "#61cad8";
    this.selectedSharedFolder = folder;
    this.routesharedchild = this.routesharedchild.slice(0, this.routesharedchild.findIndex(x => x.id === folder) + 1);
    this.fileService.listFilesByUserAndFolderWithId(userIdsubfolder, this.selectedSharedFolder).subscribe(
      response => {
        this.sharedFiles$ = of(response.files);
        this.sharedSubFolders$ = of(response.folders);
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files, response, "folder:", this.selectedSharedFolder, "user:", this.userId);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )

  }
  enterprofile(id: number, name: string) {
    console.log("id es:" + id);
    this.router.navigate(['/cloud/upload'], { queryParams: { number: id, string: name } });
  }

  search() {
    this.filteredFolders$ = this.folderList$.pipe(
      map(folders =>
        folders.filter(folder =>
          folder.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      )
    );
    this.filteredFoldersmobil$ = this.folderList$.pipe(
      map(folders =>
        folders.filter(folder =>
          folder.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      )
    );
  }

  searchsubfiles() {
    this.filteredFoldersfiles$ = this.fileList$.pipe(
      map(folders =>
        folders.filter(folder =>
          folder.title.toLowerCase().includes(this.searchTermfiles.toLowerCase())
        )
      )
    );
    this.filteredFolderssub$ = this.subfoldersList$.pipe(
      map(folders =>
        folders.filter(folder =>
          folder.name.toLowerCase().includes(this.searchTermfiles.toLowerCase())
        )
      )
    );
  }

  searchsubfilesmobile() {
    this.filteredFoldersfiles$ = this.fileList$.pipe(
      map(folders =>
        folders.filter(folder =>
          folder.title.toLowerCase().includes(this.searchTermfiles.toLowerCase())
        )
      )
    );
    this.filteredFolders$ = this.folderList$.pipe(
      map(folders =>
        folders.filter(folder =>
          folder.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      )
    );
    
      this.filteredFoldersmobil$ = this.folderListmobile$.pipe(
        map(folders =>
          folders.filter(folder =>
            folder.name.toLowerCase().includes(this.searchTermfiles.toLowerCase())
          )
        )
      );
  }

  deletefolder(nombrefolder: string) {
    this.folderService.detelefolder(nombrefolder).subscribe({
      next: (response) => {
        console.log('Folder deleted successfully: ', response);
        this.actualizarListas();
        this.mostrarMensajeDeleteExito();
      },
      error: (error) => {
        console.error('Error deleting folder', error);
        this.actualizarListas();
        this.mostrarMensajeDeleteError();
      }
    });
  }
  mostrarAlertaDelete = false;
  mostrarAlertaErrorDelete = false;
  mostrarMensajeDeleteExito() {
    this.mostrarAlertaDelete = true;
    setTimeout(() => {
      this.cerrarAlerta();
    }, 3000);
  }
  mostrarMensajeDeleteError() {
    this.mostrarAlertaErrorDelete = true;
    setTimeout(() => {
      this.cerrarAlerta();
    }, 3000);
  }
  cerrarAlerta() {
    this.mostrarAlertaDelete = false;
    this.mostrarAlertaErrorDelete = false;
  }
}
