import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable, async, map, of } from 'rxjs';
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
import { FolderDto } from '../../model/folder';
import { ModelaudioComponent } from '../modelaudio/modelaudio.component';
import { ModelvideoComponent } from '../modelvideo/modelvideo.component';
import {CdkMenu, CdkMenuItem, CdkContextMenuTrigger} from '@angular/cdk/menu';
import { ModelpdfviewComponent } from '../modelpdfview/modelpdfview.component';

import {MatGridListModule} from '@angular/material/grid-list';


import {MatListModule} from '@angular/material/list';

import { FormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDividerModule} from '@angular/material/divider';

import { ModeldeleteComponent } from '../modeldelete/modeldelete.component';

import {DatePipe} from '@angular/common';

import {ChangeDetectionStrategy} from '@angular/core';

import { Renderer2, ElementRef } from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import { response } from 'express';

import {signal} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';




export interface DialogData {
  id : number;
  name: string;
}

@Component({
  selector: 'app-share-files',
  standalone: true,
  imports: [MatExpansionModule,MatSelectModule,FormsModule,MatInputModule,MatFormFieldModule,MatListModule,MatDividerModule,MatGridListModule,CdkContextMenuTrigger, CdkMenu, CdkMenuItem,RouterModule, AsyncPipe, MatCardModule, MatButtonModule, MatMenuModule, MatIconModule, MatTooltipModule, MatProgressBarModule, TruncatePipe, TruncateDocumentNamePipe],
  templateUrl: './share-files.component.html',
  styleUrl: './share-files.component.css'
})
export class ShareFilesComponent implements OnInit{
  readonly panelOpenState = signal(false);
  idexternal: any;
  selectedDependency = "";
  selectedUser: any;
  nombreuserselected: any;

  //buscador
  searchTerm: string = '';
  filteredFolders$!: Observable<any[]>;
  filteredFoldersmobile$!: Observable<any[]>;

  searchTermsub: string = '';
  filteredFolderssub$!: Observable<any[]>;
  searchTermfiles: string = '';
  filteredFoldersfiles$!: Observable<any[]>;


  userList$!: Observable<any[]>;
  dependenciesList$!: Observable<any[]>;
  rol: any;
  backgroundColorShared = '#00A0B6'; // Color inicial shared
  backgroundColor = "white"; // Color inicial
  constructor(
    private renderer: Renderer2, private el: ElementRef,public usuarioService: UsuarioService,private route: ActivatedRoute,private authService: AuthServiceService,private router: Router,private fileService: FileService,public dialog: MatDialog,public folderService: FolderService) {}
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
  subfolderList$!: any[];
  fileList$!: Observable<any[]>;
  subfoldersList$!: Observable<any[]>;
  trigger: number = 0;
  useridglobal: any;
  //for shared folders
  selectedSharedFolder!: number;
  colorsshared!: string[];
  sharedFolders$!: Observable<any[]>;
  sharedFoldersmobile$!: Observable<any[]>;
  sharedSubFolders$!: Observable<any[]>;
  sharedSubFoldersList$!: any[];
  sharedFiles$!: Observable<any[]>;

  userId: any;
  ngOnInit(): void {
    this.dependenciesList$ = of([]);
    this.filteredFolders$ = this.sharedFolders$;
    this.filteredFoldersmobile$ = this.sharedFoldersmobile$;
    this.userList$ = of([]);
    this.useridglobal = this.authService.obtenerIdUsuario();
    this.route.queryParams.subscribe(params => {
      this.trigger = params['number'];
      if(this.trigger == 1){
        this.actualizarListas();
        this.trigger=0;
      }else{
        this.trigger=0;
      }
    });
    this.userId = this.authService.obtenerIdUsuario();
    this.subfolderList$ = [
    ];
    this.colors = [];
    this.colorsshared = [];
    this.folderList$ = of([]);
    this.actualizarListas();

    this.selectedFolder = 0;
    this.selectedSharedFolder = 0;
    this.foldername = '';

    this.sharedFiles$ = of([]);
    this.sharedFolders$ = of([]);
    this.sharedFoldersmobile$ = of([]);
    this.sharedSubFolders$ = of([]);
    //this.listarsharedfolders(this.userId);
    this.obtenerusers();

  }

  obtenerusers(){
    const userId = this.authService.obtenerIdUsuario();
    this.usuarioService.getAllUsers().subscribe(
      response => {
        this.userList$.subscribe(() => {
          this.userList$ = of(response.data.content);
          for(let i = 0; i < response.data.content.length; i++){
            if(response.data.content[i].usuarioID == userId){
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
  sharefolder(idfolder: number, ){
    this.router.navigate(['/cloud/favorites']);
    this.dialog.open(ModelsharefolderComponent, {
      data: {
        id: idfolder,
        iduser: this.userId,
      },
    });
  }

  listarsharedfolders(id: any){
    this.folderService.listSharedFolders(id).subscribe(
      response => {
        this.sharedFolders$ = of(response.data);
        this.sharedFoldersmobile$ = of(response.data);
        this.filteredFoldersmobile$ = this.sharedFoldersmobile$;
        this.filteredFolders$ = this.sharedFolders$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de sharedfolders', response,' user:');
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar sharedfolders', error);
      }
    )
  }
  listarsharedfoldersaux(id: any){
    this.nombreuserselected[0] = "Todos";
    this.folderService.listSharedFolders(id).subscribe(
      response => {
        this.sharedFolders$ = of(response.data);        
        this.sharedFoldersmobile$ = of(response.data);
        this.filteredFolders$ = this.sharedFolders$;
        this.filteredFoldersmobile$ = this.sharedFoldersmobile$;
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar sharedfolders', error);
      }
    )
  }
  listarsharedfolderscontent(id: any){
    if(this.selectedSharedFolder != 0){
      this.folderService.listSharedFolderContents(id,this.selectedSharedFolder).subscribe(
        response => {
          this.sharedFiles$ = of(response.data.files);
          this.sharedSubFolders$ = of(response.data.folders);
        },
        error => {
          // Manejar el error aquí
          console.error('Error al mostrar sharedContentfolders', error);
        }
      )
    }
  }
  actualizarListas(){
    this.routechild = [];
    setTimeout(() => {
      this.listarDependencias();
      this.folderService.getAllFolders().subscribe(
        response => {
          this.folderList$.subscribe(() => {
            this.folderList$ = of(response.data);
            this.filteredFolders$ = this.sharedFolders$;
          });
          // Manejar la respuesta de éxito aquí
          console.log('Registros de folders', response.data,' user:');
        },
        error => {
          // Manejar el error aquí
          console.error('Error al mostrar folders', error);
        }
      )
      this.fileService.listFilesByUserAndFolder(this.selectedFolder).subscribe(
        response => {
          this.fileList$ = of(response.files);
          this.subfoldersList$ = of(response.folders);
          this.sharedFolders$ = of(response.folders);
          this.sharedFoldersmobile$ = of(response.folders);
          this.filteredFoldersmobile$ = this.sharedFoldersmobile$;
          // Manejar la respuesta de éxito aquí
          console.log('Registros de files', response.files,response);
        },
        error => {
          // Manejar el error aquí
          console.error('Error al mostrar files', error);
        }

      )
    }, 500);
    setTimeout(() => {
      console.log('Pasaropn 2 segundos');
      this.folderList$.subscribe((folderList) => {
        console.log("id es:"+folderList[folderList.length-1].id, "son:"+folderList.length);
        for (let i = 0; i < folderList[folderList.length-1].id; i++) {
          this.colors[i]=this.backgroundColor;
        }
      });
    }, 1000);

    setTimeout(() => {
      this.listarsharedfolders(this.userId);
      this.listarsharedfolderscontent(this.userId);
    }, 500);
    setTimeout(() => {
      this.sharedFolders$.subscribe((folderList) => {
        console.log("id es:"+folderList[folderList.length-1].id, "son:"+folderList.length);
        for (let i = 0; i < folderList[folderList.length-1].id; i++) {
          this.colorsshared[i]=this.backgroundColorShared;
        }
      });
    }, 1000);
  }
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
  openDialogpassworddoc(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
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
        categoria: "docview",
        folderId: folderId
      },
    });
  }
  openDialogpassworddelete(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
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
  openDialogempty() {
    this.router.navigate(['/cloud/favorites']);
    this.dialog.open(ModelfolderComponent, {
      data: {
      },
    });
  }
  openDialog() {
    this.router.navigate(['/cloud/favorites']);
    this.dialog.open(ModelfolderComponent, {
      data: {
        id: this.selectedFolder,
        name: this.foldername
      },
    });
  }
  openDialogparent(idfolder: number, namefolder: string) {
    this.router.navigate(['/cloud/favorites']);
    this.dialog.open(ModelfolderComponent, {
      data: {
        id: idfolder,
        name: namefolder
      },
    });
  }

  openDialogpdf(id: number, name: string, img: string, date: string, privacy: string, folderId: number, accessType: string, password: string) {
    this.dialog.open(ModelpdfviewComponent, {
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
      },
    });
  }

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
  deletefile(id: number){
    this.fileService.deleteFile(id).subscribe({
      next: (response) => {
        console.log('File deleted successfully: ', response);
        this.fileService.listFilesByUCategory(this.selectedFolder.toString()).subscribe(
          response => {
            this.fileList$ = of(response);
            // Manejar la respuesta de éxito aquí
            console.log('Registros de files', response.title,);
          },
          error => {
            // Manejar el error aquí
            this.fileList$ = of([]);
            console.error('Error al mostrar files', error);
          }
        )

      },
      error: (error) => {
        console.error('Error deleting file', error);
        this.fileService.listFilesByUCategory(this.selectedFolder.toString()).subscribe(
          response => {
            this.fileList$ = of(response);
            // Manejar la respuesta de éxito aquí
            console.log('Registros de files', response.title,);
          },
          error => {
            // Manejar el error aquí
            this.fileList$ = of([]);
            console.error('Error al mostrar files', error);
          }
        )
        if(error.status == 200){this.mostrarMensajeDeleteExito();}else{this.mostrarMensajeDeleteError();}
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
  imprimir(objeto1: any, objeto2: any){
    console.log("entro a imprimir:",objeto1, ";", objeto2);
  }

  selectfolder(folder: any, name: string, externalid: any) {
    this.idexternal = externalid;
    if(this.parentSelectedFolder){
      const previousRectangle = this.el.nativeElement.querySelector('#rectangle'+this.parentSelectedFolder);
      if (previousRectangle) {
        this.renderer.setStyle(previousRectangle, 'background-color', this.backgroundColor);
      }
    }
    // Cambiar el color del elemento con id "rectangle" a negro
    const rectangle = this.el.nativeElement.querySelector('#rectangle'+folder);
    if (rectangle) {
      this.renderer.setStyle(rectangle, 'background-color', '#9db8dd');
    }
    this.routechild = [];
    this.subfolderList$ = [];
    this.folderList$.subscribe(() => {
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i]=this.backgroundColor;
      }
    });
    this.colors[folder-1]="#b1b0f5";
    this.selectedFolder = folder;
    this.parentSelectedFolder = folder;
    this.foldername = name;
    this.parentSelectedFolderName = name;
    console.log(this.selectedFolder);
    //pidiendo shared folders
    //this.listarsharedfolderscontent(this.userId);
    this.fileService.listFilesByUserAndFolderWhitoutID(this.selectedFolder, externalid).subscribe(
      response => {
        this.fileList$ = of(response.files);
        this.subfoldersList$ = of(response.folders);

        this.filteredFoldersfiles$ = this.fileList$;
        this.filteredFolderssub$ = this.subfoldersList$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files,response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )
    this.folderList$.subscribe((folderx) => {
      for (let i = 0; i < folderx.length; i++) {
        if (folderx[i].parentFolderId == this.selectedFolder){
          this.subfolderList$.push(folderx[i]);
          console.log('Subfolders:', this.subfolderList$);
        }
      }
    });

  }
  selectfolderchild(folder: any, name: string, externalid: any) {
    if(this.childSelectedFolder){
      const previousRectangle = this.el.nativeElement.querySelector('#subrectangle'+this.childSelectedFolder);
      if (previousRectangle) {
        this.renderer.setStyle(previousRectangle, 'background-color', this.backgroundColor);
      }
    }
    // Cambiar el color del elemento con id "rectangle"
    const rectangle = this.el.nativeElement.querySelector('#subrectangle'+folder);
    if (rectangle) {
      this.renderer.setStyle(rectangle, 'background-color', '#9db8dd');
    }
    this.subfolderList$ = [];
    this.folderList$.subscribe(() => {
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i]=this.backgroundColor;
      }
    });
    this.colors[folder-1]="#b1b0f5";
    this.selectedFolder = folder;
    this.routechild.push({id: folder, namefolder: name});
    console.log("AVERRRR",this.routechild);
    this.childSelectedFolder = folder;
    this.foldername = name;
    console.log(this.selectedFolder);
    //pidiendo shared folders
    //this.listarsharedfolderscontent(this.userId);
    this.fileService.listFilesByUserAndFolderWhitoutID(this.selectedFolder, externalid).subscribe(
      response => {
        this.fileList$ = of(response.files);
        this.subfoldersList$ = of(response.folders);

        this.filteredFoldersfiles$ = this.fileList$;
        this.filteredFolderssub$ = this.subfoldersList$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files,response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )
    this.folderList$.subscribe((folderx) => {
      for (let i = 0; i < folderx.length; i++) {
        if (folderx[i].parentFolderId == this.selectedFolder){
          this.subfolderList$.push(folderx[i]);
          console.log('Subfolders:', this.subfolderList$);
        }
      }
    });

  }

  selectfolderchildmobile(folder: any, name: string) {
    if(!this.routechild){
      this.routechild = [];
    }
    if(this.childSelectedFolder){
      const previousRectangle = this.el.nativeElement.querySelector('#subrectangle'+this.childSelectedFolder);
      if (previousRectangle) {
        this.renderer.setStyle(previousRectangle, 'background-color', this.backgroundColor);
      }
    }
    // Cambiar el color del elemento con id "rectangle"
    const rectangle = this.el.nativeElement.querySelector('#subrectangle'+folder);
    if (rectangle) {
      this.renderer.setStyle(rectangle, 'background-color', '#9db8dd');
    }
    this.subfolderList$ = [];
    this.folderList$.subscribe(() => {
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i]=this.backgroundColor;
      }
    });
    this.colors[folder-1]="#b1b0f5";
    this.selectedFolder = folder;
    this.routechild.push({id: folder, namefolder: name});
    this.childSelectedFolder = folder;
    this.foldername = name;
    this.fileService.listFilesByUserAndFolder(this.selectedFolder).subscribe(
      response => {
        this.fileList$ = of(response.files);
        this.subfoldersList$ = of(response.folders);        
        this.sharedFolders$ = of(response.folders);
        this.sharedFoldersmobile$ = of(response.folders);

        this.filteredFoldersfiles$ = this.fileList$;
        this.filteredFolders$ = this.subfoldersList$;
        this.filteredFoldersmobile$ = this.sharedFoldersmobile$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files,response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )
    this.folderList$.subscribe((folderx) => {
      for (let i = 0; i < folderx.length; i++) {
        if (folderx[i].parentFolderId == this.selectedFolder){
          this.subfolderList$.push(folderx[i]);
          console.log('Subfolders:', this.subfolderList$);
        }
      }
    });

  }
  selectfolderchildroutemobile(folder: any, name: string) {
    this.subfolderList$ = [];
    this.folderList$.subscribe(() => {
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i]=this.backgroundColor;
      }
    });
    this.colors[folder-1]="#b1b0f5";
    this.selectedFolder = folder;
    this.childSelectedFolder = folder;
    this.foldername = name;
    this.routechild = this.routechild.slice(0, this.routechild.findIndex(x => x.id === folder)+1);
    this.fileService.listFilesByUserAndFolder(this.selectedFolder).subscribe(
      response => {
        this.fileList$ = of(response.files);
        this.subfoldersList$ = of(response.folders);
        this.sharedFolders$ = of(response.folders);
        this.sharedFoldersmobile$ = of(response.folders);

        this.filteredFoldersfiles$ = this.fileList$;
        this.filteredFolders$ = this.subfoldersList$;
        this.filteredFoldersmobile$ = this.sharedFoldersmobile$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files,response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )
    this.folderList$.subscribe((folderx) => {
      for (let i = 0; i < folderx.length; i++) {
        if (folderx[i].parentFolderId == this.selectedFolder){
          this.subfolderList$.push(folderx[i]);
        }
      }
    });

  }

  searchsubfilesmobile() {
    this.filteredFoldersfiles$ = this.fileList$.pipe(
      map(folders =>
        folders.filter(folder =>
          folder.title.toLowerCase().includes(this.searchTermfiles.toLowerCase())
        )
      )
    );
    this.filteredFoldersmobile$ = this.sharedFoldersmobile$.pipe(
      map(folders =>
        folders.filter(folder =>
          folder.name.toLowerCase().includes(this.searchTermfiles.toLowerCase())
        )
      )
    );
  }

  selectfolderchildroute(folder: any, name: string) {
    this.subfolderList$ = [];
    this.folderList$.subscribe(() => {
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i]=this.backgroundColor;
      }
    });
    this.colors[folder-1]="#b1b0f5";
    this.selectedFolder = folder;
    this.childSelectedFolder = folder;
    this.foldername = name;
    this.routechild = this.routechild.slice(0, this.routechild.findIndex(x => x.id === folder)+1);
    this.fileService.listFilesByUserAndFolder(this.selectedFolder).subscribe(
      response => {
        this.fileList$ = of(response.files);
        this.subfoldersList$ = of(response.folders);
        this.sharedFolders$ = of(response.folders);
        this.filteredFoldersfiles$ = this.fileList$;
        this.filteredFolderssub$ = this.subfoldersList$;
        this.filteredFoldersmobile$ = this.sharedFolders$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files,response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )
    this.folderList$.subscribe((folderx) => {
      for (let i = 0; i < folderx.length; i++) {
        if (folderx[i].parentFolderId == this.selectedFolder){
          this.subfolderList$.push(folderx[i]);
          console.log('Subfolders:', this.subfolderList$);
        }
      }
    });

  }

  selectsharedfolder(folder: any, name: string) {
    this.routesharedchild = [];
    this.sharedSubFoldersList$ = [];
    this.sharedFolders$.subscribe(() => {
      for (let i = 0; i < this.colorsshared.length; i++) {
        this.colorsshared[i]=this.backgroundColorShared;
      }
    });
    this.colorsshared[folder-1]="#61cad8";
    this.parentSharedSelectedFolder = folder;
    this.parentSharedSelectedFolderName = name;
    this.selectedSharedFolder = folder;
    this.folderService.listSharedFolderContents(this.userId, this.selectedSharedFolder).subscribe(
      response => {
      this.sharedFiles$ = of(response.data.files);
      this.sharedSubFolders$ = of(response.data.folders);
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.data.files,response);
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
        this.colorsshared[i]=this.backgroundColorShared;
      }
    });
    this.colorsshared[folder-1]="#61cad8";
    this.selectedSharedFolder = folder;
    this.routesharedchild.push({id: folder, namefolder: name, userId: userIdsubfolder});
    this.fileService.listFilesByUserAndFolderWithId(userIdsubfolder,this.selectedSharedFolder).subscribe(
      response => {
        this.sharedFiles$ = of(response.files);
        this.sharedSubFolders$ = of(response.folders);
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files,response, "folder:", this.selectedSharedFolder, "user:", this.userId);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )

  }
  selectsharedsubfolderroute(folder: any, name: string, userIdsubfolder: number) {
    this.sharedSubFoldersList$ = [];
    this.sharedFolders$.subscribe(() => {
      for (let i = 0; i < this.colorsshared.length; i++) {
        this.colorsshared[i]=this.backgroundColorShared;
      }
    });
    this.colorsshared[folder-1]="#61cad8";
    this.selectedSharedFolder = folder;
    this.routesharedchild = this.routesharedchild.slice(0, this.routesharedchild.findIndex(x => x.id === folder)+1);
    this.fileService.listFilesByUserAndFolderWithId(userIdsubfolder,this.selectedSharedFolder).subscribe(
      response => {
        this.sharedFiles$ = of(response.files);
        this.sharedSubFolders$ = of(response.folders);
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.files,response, "folder:", this.selectedSharedFolder, "user:", this.userId);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar files', error);
      }

    )

  }
  enterprofile(id: number, name: string){
    this.router.navigate(['/cloud/upload'], { queryParams: { number: id, string: name } });
  }

  search() {
    this.filteredFolders$ = this.sharedFolders$.pipe(
      map(folders =>
        folders.filter(folder =>
          folder.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      )
    );
  }

  listarDependencias(){
    this.folderService.getAllDependencies().subscribe(
      response => {
        this.dependenciesList$ = of(response.data);
        // Manejar la respuesta de éxito aquí
        console.log('Registros de dependencias', response.data);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar dependencias', error);
      }
    )
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

  getfolderbydependency(){
    this.folderService.getfoldersbydependency(this.nombreuserselected[0]).subscribe(
      response => {
        this.sharedFolders$ = of(response.data);
        this.filteredFolders$ = this.sharedFolders$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de folders', response.data);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar folders', error);
      }
    )

  }

  getfolderbyuser(){
    this.folderService.getfoldersbyuser(this.nombreuserselected[1].usuarioID).subscribe(
      response => {
        this.sharedFolders$ = of(response.data);
        this.filteredFolders$ = this.sharedFolders$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de folders', response.data);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar folders', error);
      }
    )


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

