import { AsyncPipe, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { ModelimgComponent } from '../modelimg/modelimg.component';
import { ModelsharingComponent } from '../modelsharing/modelsharing.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { FileService } from '../../service/file.service';
import { FolderService } from '../../service/folder.service'
import { TruncatePipe } from "../../truncate.pipe";
import { AuthServiceService } from '../../service/auth-service.service';
import { FormControl } from '@angular/forms';


import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActividadService } from '../../service/actividad.service';
import { IpserviceService } from '../../service/ipservice.service';
import { FormatDatePipe } from "../../pipes/format-date.pipe";
import { TruncateDocumentNamePipe } from "../../pipes/truncate-document-name.pipe";
import { ModelpdfComponent } from '../modelpdf/modelpdf.component';
import { set } from 'date-fns';
import { ModelpasswordComponent } from '../modelpassword/modelpassword.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ModeldeleteComponent } from '../modeldelete/modeldelete.component';
import { NotificationService } from '../../service/notification.service';


import { CommonModule } from '@angular/common'; // Importa CommonModule
import { UsuarioService } from '../../service/usuario.service';

export interface DialogData {
  idperson: string;
  id : number;
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
  titulo?: string;
}

interface fileprivacy {
  valuex: string;
  viewValue: string;
}

export interface User {
  usuarioID: number;
  nombres: string;
  paterno: string;
  name: string;
  id: number;
  dependencia: string;
}

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [CommonModule,MatListModule,ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatSelectModule, MatInputModule, NgxDropzoneModule, MatProgressBarModule, FormsModule, AsyncPipe, MatCardModule, MatButtonModule, MatMenuModule, MatIconModule, TruncatePipe, FormatDatePipe, TruncateDocumentNamePipe]
})
export class HomeComponent implements OnInit{

  //buscador
  searchTerm!: string;
  filteredFolders$!: Observable<any[]>;

  searchTermsub: string = '';
  filteredFolderssub$!: Observable<any[]>;
  searchTermfiles: string = '';
  filteredFoldersfiles$!: Observable<any[]>;

  //storage
  totalStorage: number = 1; // Total storage in GB
  usedStorage: number = 0; // Used storage in GB

  googleDriveUsage!: number;
  googlePhotosUsage!: number;
  gmailUsage!: number;
  otherUsage!: number;

  //finstorage

  stringerror = 'Hubo un error';
  messageerror = '';
  hide = true;
  description= new FormControl('');
  accessType= new FormControl('');
  password= new FormControl('');
  folderId= new FormControl('');
  files: File[] = [];
  folders$!: Observable<any[]>;
  selectedFolderId!: string;
  selectedAccessType: string = 'publico'; // Valor predeterminado
  selectedPassword: string = ''; // Valor predeterminado
  selectedCategory: string = 'Nuevo'; // Valor predeterminado
  accessTypes: string[] = ['publico', 'privado', 'restringido'];
  categories: string[] = ['Sellado', 'Nuevo', 'Reemplazado'];
  useridglobal: any;
  cantNuevo: number = 0;
  cantSellado: number = 0;
  cantReemplazado: number = 0;
  iduser: number = 0;
  trigger: number = 0;
  storageUsed: number = 0;
  //paginacion
  recentFiles: any[] = [];
  paginatedFiles: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalFiles: number = 0;
  userList$!: Observable<any[]>;
  fileListfiltered$!: Observable<any[]>;


  titlealert = new FormControl('');

  messagealert = new FormControl('');
  rol: any;

  myControl = new FormControl<string | User>('');
  options: any[] = [];
  filteredOptions?: Observable<User[]>;

  categoryList$: Observable<any[]> = of([
    {id:1, nombrex: 'Sellados', color: "#06367A", name: 'Sellado', numberOfFiles: this.cantSellado, numberOfSubCategories:this.cantSellado, icon: 'check'},
    {id:2, nombrex: 'Nuevos', color: "#6E9887", name: 'Nuevo', numberOfFiles: this.cantNuevo, numberOfSubCategories: this.cantNuevo, icon: 'fiber_new'},
    //{id:3, nombrex: 'A Reemplazar', color: "#E06C9F", name: 'Reemplazado', numberOfFiles: this.cantReemplazado, numberOfSubCategories: this.cantReemplazado, icon: 'autorenew'},
  ]);
  fileList$!: Observable<any[]>;
  notificationList$!: Observable<any[]>;

  publicFilesList$!: Observable<any[]>;

  selectedFolder!: string;

  constructor(
    public notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthServiceService,
    public dialog: MatDialog,
    private fileService: FileService,
    public folderService: FolderService,
    public actividadService: ActividadService,
    public ipService: IpserviceService,public usuarioService: UsuarioService,
  ) {}

  backgroundColor = '#6663FE'; // Color inicial
  colors!: string[];

  categoriesList$!: Observable<any[]>;
  filesList$!: Observable<any[]>;
  recentFilesList$!: Observable<any[]>;

  ngOnInit(): void {
    this.fileListfiltered$ = this.fileList$;
    this.userList$ = of([]);
    this.route.queryParams.subscribe(params => {
      this.trigger = params['number'];
      if(this.trigger == 1){
        this.actualizarListas();
        this.trigger=0;
      }else{
        this.trigger=0;
      }
    });
    this.obtenerusers();
    this.loadRecentFiles();
    this.actualizarListas();
    this.loadNotifications();
    this.colors = [];
    this.categoryList$ = of([]);
    this.fileList$ = of([]);
    const userIdGlobal = this.authService.obtenerIdUsuario();
    this.iduser= parseInt(userIdGlobal||"");
    this.fileService.countCategoriesByUser(this.iduser).subscribe(
      response => {
        this.cantNuevo = response.Nuevo;
        this.cantSellado = response.Sellado;
        this.cantReemplazado = response.Reemplazado;

        // Manejar la respuesta de éxito aquí
        console.log('Registros de categorias',response, response.Nuevo, response.Sellado, response.Reemplazado);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar categorias', error);
      }
    );

    setTimeout(() => {
      this.categoryList$.subscribe((categoryList) => {
        if (categoryList.length > 0) {
          const lastCategory = categoryList[categoryList.length - 1];
          console.log("id es:" + lastCategory.id, "son:" + categoryList.length);
          for (let i = 0; i < categoryList.length; i++) {
            this.colors[i] = this.backgroundColor;
          }
        } else {
          console.log("La lista de categorías está vacía");
        }
      });
      this.fileService.getRecentFiles().subscribe(
        response => {
          this.recentFilesList$ = of(response);
          // Manejar la respuesta de éxito aquí
          console.log('Registros de files', response);
        },
        error => {
          // Manejar el error aquí
          this.recentFilesList$ = of([]);
          console.error('Error al mostrar files', error);
        }
      )
    }, 500);
    this.selectedFolder = "";

    this.selectedFolderId = '';
    this.recentFilesList$ = of([
      { id: 1, name: 'Recent File 1.mp3', format: 'jpg', size: '2.3MB', progress: 50 },
      { id: 2, name: 'Recent File 2.png', format: 'doc', size: '1.3MB', progress: 70 },
      { id: 3, name: 'Recent File 3.txt', format: 'mp4', size: '4.3MB', progress: 30 },
      { id: 4, name: 'Recent File 4.mp3', format: 'mp3', size: '3.3MB', progress: 90 },
    ]);

    // Carga la lista de folders desde el FolderService
    const userId = this.authService.obtenerIdUsuario();
    if (userId) {
      this.useridglobal = userId;
      this.folderService.getAllFolders().pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching folders:', error);
          return of([]); // Return an empty observable in case of error
        })
      ).subscribe(folders => {
        this.options = folders;
      });
    } else {
      console.error('User ID is not available. Make sure the user is logged in.');
    }

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        this.selectedFolderId = typeof value === 'string' ? value : value?.id.toString() || '';
        return name ? this._filter(name as string) : this.options.slice();
      }),
    );

    this.cargarArchivosPublicos();
  }

  search() {
    this.fileListfiltered$ = this.fileList$.pipe(
      map(folders =>
        folders.filter(folder =>
          folder.title.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      )
    );
  }

  sendmessage(){
    if(this.titlealert.value == "" || this.messagealert.value == ""){
      this.messageerror = 'Todos los campos son requeridos';
      this.mostrarMensajeMessageError();

      console.error('Espacio maximo alcanzado.');
      return;
    }
    const body = {
      titulo: this.titlealert.value,
      mensaje: this.messagealert.value,
      tipo: "general"
    };
    this.notificationService.sendmessage(body).subscribe({
      next: (response) => {
        console.log('Mensaje enviado correctamente', response);
        this.mostrarMensajeMessageExito();
        this.loadNotifications();
        this.titlealert.setValue('');
        this.messagealert.setValue('');
      },
      error: (error) => {
        if(error.status == 200){
          this.mostrarMensajeMessageExito();
          this.loadNotifications();
          this.titlealert.setValue('');
          this.messagealert.setValue('');
        }else{
          console.error('Error al enviar mensaje', error);
          this.mostrarMensajeMessageError();
        }
      }
    });
  }

  loadNotifications() {
    this.notificationService.obtenerNotificacionesNoleidas().subscribe({
      next: (data) => {
        console.log('Notificaciones no leídas:', data);
        this.notificationList$ = of(data);
      },
      error: (error) => {
        console.error('Error al cargar notificaciones no leídas', error);
      }
    });
  }
  readNotifications(idnoti: any) {
    this.notificationService.notifleida(idnoti).subscribe({
      next: (data) => {
        console.log('Notificaciones leida:', data);
        this.loadNotifications();
      },
      error: (error) => {
        console.error('Error al marcar leídas', error);
        this.loadNotifications();
      }
    });
  }

  obtenerusers(){
    const userId = this.authService.obtenerIdUsuario();
    this.usuarioService.getAllUsers().subscribe(
      response => {
        this.userList$.subscribe(() => {
          this.userList$ = of(response.data.content);
          for(let i = 0; i < response.data.content.length; i++){
            if(response.data.content[i].usuarioID == userId){
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

  loadRecentFiles() {
    this.fileService.getRecentFiles().subscribe({
      next: (data) => {
        this.recentFiles = data;
        this.totalFiles = data.length;
        this.updatePage(1);
      },
      error: (error) => console.error('Error al cargar archivos recientes', error)
    });
  }

  updatePage(pageNumber: number) {
    this.currentPage = pageNumber;
    const startIndex = (pageNumber - 1) * this.pageSize;
    this.paginatedFiles = this.recentFiles.slice(startIndex, startIndex + this.pageSize);
  }

  actualizarListas(){
    setTimeout(() => {
      const userIdGlobal = this.authService.obtenerIdUsuario();
      this.iduser= parseInt(userIdGlobal||"");
      this.fileService.countCategoriesByUser(this.iduser).subscribe(
        response => {
          this.cantNuevo = response.Nuevo;
          this.cantSellado = response.Sellado;
          this.cantReemplazado = response.Reemplazado;

          // Manejar la respuesta de éxito aquí
          console.log('Registros de categorias',response, response.Nuevo, response.Sellado, response.Reemplazado);
        },
        error => {
          // Manejar el error aquí
          console.error('Error al mostrar categorias', error);
        }
      );
      this.fileService.getStorageUsedByUser(this.iduser).subscribe(
        response => {
          console.log('Storage encontrado',response.data.CountByFileType);
          const sum = response.data.CountByFileType.PDF + response.data.CountByFileType.Video + response.data.CountByFileType.Música + response.data.CountByFileType.Imagen;
          this.usedStorage = parseFloat(response.data.TotalSize.slice(0, -3))/1024;

          // Calculate percentages based on total storage
          this.googleDriveUsage = (((response.data.CountByFileType.PDF*100)/sum) / 100) * (this.usedStorage / this.totalStorage) * 100;
          this.googlePhotosUsage = (((response.data.CountByFileType.Video*100)/sum) / 100) * (this.usedStorage / this.totalStorage) * 100;
          this.gmailUsage = (((response.data.CountByFileType.Música*100)/sum) / 100) * (this.usedStorage / this.totalStorage) * 100;
          this.otherUsage = (((response.data.CountByFileType.Imagen*100)/sum) / 100) * (this.usedStorage / this.totalStorage) * 100;
        },
        error => {
          // Manejar el error aquí
          console.error('Error al mostrar Storage', error);
        }
      );
      setTimeout(() => {
        this.categoryList$ = of([
    {id:1, nombrex: 'Sellados', color: "#06367A", name: 'Sellado', numberOfFiles: this.cantSellado, numberOfSubCategories:this.cantSellado, icon: 'check'},
    {id:2, nombrex: 'Nuevos', color: "#6E9887", name: 'Nuevo', numberOfFiles: this.cantNuevo, numberOfSubCategories: this.cantNuevo, icon: 'fiber_new'},
    //{id:3, nombrex: 'A Reemplazar', color: "#E06C9F", name: 'Reemplazado', numberOfFiles: this.cantReemplazado, numberOfSubCategories: this.cantReemplazado, icon: 'autorenew'},
  ]);
        this.fileService.getRecentFiles().subscribe(
          response => {
            this.recentFilesList$ = of(response);
            // Manejar la respuesta de éxito aquí
            console.log('Registros de files', response);
          },
          error => {
            // Manejar el error aquí
            this.recentFilesList$ = of([]);
            console.error('Error al mostrar files', error);
          }
        )
        this.fileService.listFilesByUCategory(this.selectedFolder).subscribe(
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
      },500);
    },500);

  }

  openDialogpasswordimg(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
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
        categoria: "img",
        folderId: folderId
      },
    });
  }
  openDialogpassworddoc(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
    this.router.navigate(['/cloud/home']);
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
  openDialogpassworddelete(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
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
        categoria: "delete",
        folderId: folderId
      },
    });
  }
  openDialogpasswordshare(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
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
        categoria: "share",
        folderId: folderId
      },
    });
  }

  openDialog(id: number, name: string, img: string, date: string, privacy: string) {
    this.router.navigate(['/cloud/home']);
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

  openDialogpdf(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
    this.router.navigate(['/cloud/home']);
    this.dialog.open(ModelpdfComponent, {
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
        folderId: folderId
      },
    });
  }

  openDialogDelete(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
    this.router.navigate(['/cloud/home']);
    this.dialog.open(ModeldeleteComponent, {
      data: {
        id: id,
        name: name,
        img: img,
        date: date,
        privacy: "home",
        iduser: iduser,
        description: description,
        accessType: accessType,
        password: password,
        categoria: categoria,
        folderId: folderId
      },
    });
  }

  openDialogShare(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
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
        folderId: folderId

      },
    });
  }




  // in app.component.ts
  fileprivacys: fileprivacy[] = [
    {valuex: 'publico', viewValue: 'Publico'},
    {valuex: 'privado', viewValue: 'Privado'},
    {valuex: 'restringido', viewValue: 'Restringido'},
  ];

  onSelect(event: any) {
    console.log(event);
    this.files.push(...event.addedFiles);

    // Asegúrate de que se haya seleccionado un folder
    if (!this.selectedFolderId) {
      this.stringerror = 'No folder selected.';
      this.mostrarMensajeRegistroError();
      return;
    }

    const userId = this.authService.obtenerIdUsuario(); // Obtiene el userId del AuthService
    if (!userId) {
      console.error('User ID is not available. Make sure the user is logged in.');
      return;
    }

    if (!this.accessType.value) {
      this.mostrarMensajeRegistroError();
      this.stringerror = 'AccessType is required.';
      console.error('AccessType is required.');
      return;
    }

    // Asumiendo que el servicio IpService ya ha sido inyectado e implementado
    this.ipService.getIp().subscribe({
      next: (ipResponse) => {
        const ip = ipResponse.ip;
        // Registro de la actividad antes de la subida del archivo
        const actividadData = {
          nombre: "Subida de Archivo",
          ip: ip,
          tipoActividad: "Subida",
          usuarioId: userId
        };

        this.actividadService.crearActividad(actividadData).subscribe({
          next: (resp) => {
            console.log('Actividad registrada con éxito', resp);

            // Ahora, procede con la subida del archivo
            const fileToUpload = event.addedFiles[0]; // Toma el primer archivo añadido
            const data = {
              title: "titulo",
              description: this.description.value,
              etag: "etag",
              accessType: this.accessType.value,
              password: this.password.value,
              createdDate: new Date().toISOString(),
              modifiedDate: new Date().toISOString(),
              categoria: this.selectedCategory,
              deleted: false,
              userId: userId,
              folderId: this.selectedFolderId,
            };

            // Usar fileService para subir el archivo
            this.fileService.uploadFile(this.selectedFolderId, fileToUpload, data).subscribe({
              next: (response) => console.log('File uploaded successfully', response, this.mostrarMensajeRegistroExito(), this.actualizardatos(), this.actualizarListas()),
              error: (error) => console.error('Error uploading file', error," data:" ,data,"this folder",this.selectedFolderId, this.mostrarMensajeRegistroExito(), this.actualizardatos(), this.actualizarListas())
            });
          },
          error: (err) => {
            console.error('Error al registrar actividad', err);
            // Aquí puedes decidir si aún quieres intentar subir el archivo o no
          }
        });
      },
      error: (err) => {
        console.error('Error obteniendo IP del usuario', err);
        // Considera cómo manejar este caso. ¿Quieres continuar con la subida del archivo sin registrar la IP?
      }
    });
  }

  actualizardatos(){
    this.fileService.getRecentFiles().subscribe(
      response => {
        this.recentFilesList$ = of(response);
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response);
      },
      error => {
        // Manejar el error aquí
        this.recentFilesList$ = of([]);
        console.error('Error al mostrar files', error);
      }
    )
    this.fileService.listFilesByUCategory(this.selectedFolder).subscribe(
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
  }

  deletefile(id: number){
    this.fileService.deleteFile(id).subscribe({
      next: (response) => {
        console.log('File deleted successfully: ', response);
        this.fileService.listFilesByUCategory(this.selectedFolder).subscribe(
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
        this.fileService.getRecentFiles().subscribe(
          response => {
            this.recentFilesList$ = of(response);
            // Manejar la respuesta de éxito aquí
            console.log('Registros de files', response);
          },
          error => {
            // Manejar el error aquí
            this.recentFilesList$ = of([]);
            console.error('Error al mostrar files', error);
          }
        )
        this.cargarArchivosPublicos();

      },
      error: (error) => {
        console.error('Error deleting file', error);
        this.fileService.listFilesByUCategory(this.selectedFolder).subscribe(
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
        this.fileService.getRecentFiles().subscribe(
          response => {
            this.recentFilesList$ = of(response);
            // Manejar la respuesta de éxito aquí
            console.log('Registros de files', response);
          },
          error => {
            // Manejar el error aquí
            this.recentFilesList$ = of([]);
            console.error('Error al mostrar files', error);
          }
        )
        this.cargarArchivosPublicos();
        if(error.status == 200){this.mostrarMensajeDeleteExito();}else{this.mostrarMensajeDeleteError();}
      }
    });
  }


  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  displayFn(user: User): any {
    if(user && user.id){
      this.selectedFolderId = user.id.toString();
      console.log(this.selectedFolderId);
    }
    return user && user.name ? user.name : "";
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  selectfolder(folderName: string,folderid: number) {
    this.searchTerm = '';
    this.categoryList$.subscribe(() => {
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i]=this.backgroundColor;
      }
    });
    this.colors[folderid-1]="#b1b0f5";
    this.selectedFolder = folderName;
    console.log(this.selectedFolder);
    this.fileService.listFilesByUCategory(this.selectedFolder).subscribe(
      response => {
        this.fileList$ = of(response);
        this.fileListfiltered$ = this.fileList$;
        // Manejar la respuesta de éxito aquí
        console.log('Registros de files', response.title,);
      },
      error => {
        // Manejar el error aquí
        this.fileList$ = of([]);
        console.error('Error al mostrar files', error);
      }
    )


  }
  mostrarAlerta = false;
  mostrarAlertaError = false;
  mostrarAlertaDelete = false;
  mostrarAlertaErrorDelete = false;
  mostrarAlertaMessage = false;
  mostrarAlertaMessageError = false;
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
  mostrarMensajeMessageExito() {
    this.mostrarAlertaMessage = true;
    setTimeout(() => {
      this.cerrarAlerta();
    }, 3000);
  }
  mostrarMensajeMessageError() {
    this.mostrarAlertaMessageError = true;
    setTimeout(() => {
      this.cerrarAlerta();
    }, 3000);
  }
  cerrarAlerta() {
    this.mostrarAlerta = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaDelete = false;
    this.mostrarAlertaErrorDelete = false;
    this.mostrarAlertaMessage = false;
    this.mostrarAlertaMessageError = false;
  }

  cargarArchivosPublicos() {
    this.fileService.getPublicFiles().subscribe({
      next: (data) => {
        this.publicFilesList$ = of(data); // Asignar datos a la variable
        console.log('Archivos públicos cargados correctamente', data);
      },
      error: (error) => {
        console.error('Error al cargar archivos públicos', error);
      }
    });
  }

  // sendOnEnter(){
  //   this.sendmessage();
  // }

}
