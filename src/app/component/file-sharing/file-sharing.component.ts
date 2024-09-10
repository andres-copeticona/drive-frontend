import { Component, OnInit } from '@angular/core';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ShareService } from '../../service/share.service';
import { AuthServiceService } from '../../service/auth-service.service';
import { TruncatePipe } from '../../truncate.pipe';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { TruncateDocumentNamePipe } from '../../pipes/truncate-document-name.pipe';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActividadService } from '../../service/actividad.service';
import { FileService } from '../../service/file.service';
import { FolderService } from '../../service/folder.service';
import { IpserviceService } from '../../service/ipservice.service';
import { ModelimgComponent } from '../modelimg/modelimg.component';
import { ModelpdfComponent } from '../modelpdf/modelpdf.component';
import { ModelsharingComponent } from '../modelsharing/modelsharing.component';
import { UsuarioService } from '../../service/usuario.service';
import { Router } from '@angular/router';
import { ModelpasswordComponent } from '../modelpassword/modelpassword.component';
import { ModelpdfviewComponent } from '../modelpdfview/modelpdfview.component';

import { MatListModule } from '@angular/material/list';

import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import {
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { ModelfolderComponent } from '../modelfolder/modelfolder.component';
import { read } from 'fs';
import { ActivatedRoute } from '@angular/router';
import { ModelsharefolderComponent } from '../modelsharefolder/modelsharefolder.component';
import { FolderDto } from '../../model/folder';
import { ModelaudioComponent } from '../modelaudio/modelaudio.component';
import { ModelvideoComponent } from '../modelvideo/modelvideo.component';
import { CdkMenu, CdkMenuItem, CdkContextMenuTrigger } from '@angular/cdk/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { ModeldeleteComponent } from '../modeldelete/modeldelete.component';

import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';

import { ChangeDetectionStrategy } from '@angular/core';

import { Renderer2, ElementRef } from '@angular/core';

export interface DialogData {
  id: number;
  name: string;
  img: string;
  date: string;
  privacy: string;
  iduser: any;
  description: string;
  accessType: string;
  password: string;
  categoria: string;
  folderId: string;
}

interface fileprivacy {
  valuex: string;
  viewValue: string;
}

export interface User {
  usuarioID: number;
  nombres: string;
  name: string;
  id: number;
}

@Component({
  selector: 'app-file-sharing',
  standalone: true,
  templateUrl: './file-sharing.component.html',
  styleUrl: './file-sharing.component.css',
  imports: [
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
  ],
})
export class FileSharingComponent implements OnInit {
  //buscador  de archivos
  searchTerm: string = '';
  filteredFolders$!: Observable<any[]>;

  stringerror = 'Hubo un error';
  hide = true;
  description = new FormControl('');
  accessType = new FormControl('');
  password = new FormControl('');
  folderId = new FormControl('');
  files: File[] = [];
  folders$!: Observable<any[]>;
  selectedFolderId!: string;
  selectedAccessType: string = 'publico'; // Valor predeterminado
  selectedPassword: string = ''; // Valor predeterminado
  selectedCategory: string = 'Nuevo'; // Valor predeterminado
  accessTypes: string[] = ['publico', 'privado', 'restringido'];
  categories: string[] = ['Sellado', 'Nuevo', 'Reemplazado'];
  useridglobal: any;

  myControl = new FormControl<string | User>('');
  options: any[] = [];
  filteredOptions?: Observable<User[]>;

  categoryList$!: Observable<any[]>;
  fileList$!: Observable<any[]>;

  selectedFolder!: string;
  constructor(
    private router: Router,
    public shareService: ShareService,
    private authService: AuthServiceService,
    public dialog: MatDialog,
    private fileService: FileService,
    public folderService: FolderService,
    public actividadService: ActividadService,
    public ipService: IpserviceService,
    private usuarioService: UsuarioService,
  ) {}
  backgroundColor = '#6663FE'; // Color inicial
  colors!: string[];

  categoriesList$!: Observable<any[]>;
  filesList$!: Observable<any[]>;
  recentFilesList$!: Observable<any[]>;

  ngOnInit(): void {
    this.colors = [];
    this.categoryList$ = of([]);
    this.fileList$ = of([]);

    setTimeout(() => {
      const userId1 = this.authService.obtenerIdUsuario() || '';
      this.shareService.getSharedDocuments(parseInt(userId1)).subscribe(
        (response) => {
          this.recentFilesList$ = of(response);
          this.filteredFolders$ = this.recentFilesList$;
          // Manejar la respuesta de éxito aquí
          console.log('Registros de shared', response);
        },
        (error) => {
          // Manejar el error aquí
          this.recentFilesList$ = of([]);
          console.error('Error al mostrar shared', error);
        },
      );
    }, 500);
  }
  search() {
    this.filteredFolders$ = this.recentFilesList$.pipe(
      map((folders) =>
        folders.filter((folder) =>
          folder.nombreDocumento
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()),
        ),
      ),
    );
  }

  openDialog(
    id: number,
    name: string,
    img: string,
    date: string,
    privacy: string,
  ) {
    this.router.navigate(['/cloud/home']);
    this.dialog.open(ModelimgComponent, {
      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: privacy,
      },
    });
  }

  cargarDatosUsuario(idus: number): string {
    let nombre: string = '';
    this.usuarioService.getUserProfile(idus).subscribe({
      next: (respuesta) => {
        nombre = respuesta.data.nombres + ' ' + respuesta.data.paterno;
        console.log('Respuesta recibida:', nombre); // Imprimir la respuesta recibida
      },
      error: (error) => {
        console.error('Error al obtener los datos del usuario', error);
      },
    });
    return nombre;
  }
  openDialogpasswordimg(
    id: number,
    name: string,
    img: string,
    date: string,
    privacy: string,
    iduser: any,
    description: string,
    accessType: string,
    password: string,
    categoria: string,
    folderId: string,
  ) {
    this.router.navigate(['/cloud/home']);
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
        categoria: 'img',
        folderId: folderId,
      },
    });
  }
  openDialogpassworddoc(
    id: number,
    name: string,
    img: string,
    date: string,
    privacy: string,
    iduser: any,
    description: string,
    accessType: string,
    password: string,
    categoria: string,
    folderId: string,
  ) {
    this.router.navigate(['/cloud/home']);
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
        categoria: 'doc',
        folderId: folderId,
      },
    });
  }
  openDialogpassworddelete(
    id: number,
    name: string,
    img: string,
    date: string,
    privacy: string,
    iduser: any,
    description: string,
    accessType: string,
    password: string,
    categoria: string,
    folderId: string,
  ) {
    this.router.navigate(['/cloud/home']);
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
        categoria: 'delete',
        folderId: folderId,
      },
    });
  }
  openDialogpasswordshare(
    id: number,
    name: string,
    img: string,
    date: string,
    privacy: string,
    iduser: any,
    description: string,
    accessType: string,
    password: string,
    categoria: string,
    folderId: string,
  ) {
    this.router.navigate(['/cloud/home']);
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
        categoria: 'share',
        folderId: folderId,
      },
    });
  }

  openDialogpdf(
    id: number,
    name: string,
    img: string,
    date: string,
    privacy: string,
    iduser: any,
    description: string,
    accessType: string,
    password: string,
    categoria: string,
    folderId: string,
  ) {
    this.router.navigate(['/cloud/sharedFiles']);
    this.dialog.open(ModelpdfviewComponent, {
      height: '90%',
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
        categoria: categoria,
        folderId: folderId,
      },
    });
  }
  openDialogShare(
    id: number,
    name: string,
    img: string,
    date: string,
    privacy: string,
    iduser: any,
    description: string,
    accessType: string,
    password: string,
    categoria: string,
    folderId: string,
  ) {
    this.router.navigate(['/cloud/home']);
    this.dialog.open(ModelsharingComponent, {
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
        categoria: categoria,
        folderId: folderId,
      },
    });
  }
  deletefile(id: number) {
    this.fileService.deleteFile(id).subscribe({
      next: (response) => {
        console.log('File deleted successfully: ', response);
        this.fileService.listFilesByUCategory(this.selectedFolder).subscribe(
          (response) => {
            this.fileList$ = of(response);
            // Manejar la respuesta de éxito aquí
            console.log('Registros de files', response.title);
          },
          (error) => {
            // Manejar el error aquí
            this.fileList$ = of([]);
            console.error('Error al mostrar files', error);
          },
        );
      },
      error: (error) => {
        console.error('Error deleting file', error);
        this.fileService.listFilesByUCategory(this.selectedFolder).subscribe(
          (response) => {
            this.fileList$ = of(response);
            // Manejar la respuesta de éxito aquí
            console.log('Registros de files', response.title);
          },
          (error) => {
            // Manejar el error aquí
            this.fileList$ = of([]);
            console.error('Error al mostrar files', error);
          },
        );
        if (error.status == 200) {
          this.mostrarMensajeDeleteExito();
        } else {
          this.mostrarMensajeDeleteError();
        }
      },
    });
  }
  mostrarAlerta = false;
  mostrarAlertaError = false;
  mostrarAlertaDelete = false;
  mostrarAlertaErrorDelete = false;
  mostrarMensajeRegistroExito() {
    this.mostrarAlerta = true;
    setTimeout(() => {
      this.cerrarAlerta();
    }, 3000);
  }
  mostrarMensajeRegistroError() {
    this.mostrarAlertaError = true;
    setTimeout(() => {
      this.cerrarAlerta();
    }, 3000);
  }
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
    this.mostrarAlerta = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaDelete = false;
    this.mostrarAlertaErrorDelete = false;
  }
}
