import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
import { Observable, catchError, last, map, of ,startWith} from 'rxjs';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { FileService } from '../../service/file.service';
import { AuthServiceService } from '../../service/auth-service.service';
import { FolderService } from '../../service/folder.service';

import {FormsModule,FormControl,ReactiveFormsModule, FormGroup} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { title } from 'process';
import { ActividadService } from '../../service/actividad.service';
import { IpserviceService } from '../../service/ipservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { set } from 'date-fns';
import {MatExpansionModule} from '@angular/material/expansion';

interface fileprivacy {
  valuex: string;
  viewValue: string;
}

export interface User {
  name: string;
  id: number;
}

interface FileUpload {
  name: string;
  progress: number;
  size: string;
}

@Component({
  selector: 'app-uploads',
  standalone: true,
  imports: [MatExpansionModule,ReactiveFormsModule,MatAutocompleteModule,MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule,CommonModule,NgxDropzoneModule,AsyncPipe,MatCardModule,MatButtonModule, MatMenuModule, MatIconModule, MatTooltipModule, MatProgressBarModule],
  templateUrl: './uploads.component.html',
  styleUrl: './uploads.component.css'
})
export class UploadsComponent implements OnInit {
  panelOpenState = true;
  stringerror = 'Hubo un error';
  hide = true;
  description= new FormControl('');
  accessType= new FormControl('');
  password= new FormControl('');
  folderId= new FormControl('');
  recentFilesList$!: Observable<any[]>;
  files: File[] = [];
  folders$!: Observable<any[]>;
  selectedFolderId!: string;
  selectedFolderIdfromFavorites!: string;
  selectedAccessType: string = 'publico'; // Valor predeterminado
  selectedCategory: string = 'Nuevo'; // Valor predeterminado
  accessTypes: string[] = ['publico', 'privado', 'restringido'];
  categories: string[] = ['Sellado', 'Nuevo', 'Reemplazado'];
  inputlabelfolder: string = 'Ingresa la carpeta';
  filesInProcess: FileUpload[] = [];
  uploadedFiles: FileUpload[] = [];
  storageUsed: number = 0;

  myControl = new FormControl<string | User>('');
  options: any[] = [];
  filteredOptions?: Observable<User[]>;

  allowedFileFormats = ['mp3', 'mp4', 'jpg', 'png', 'pdf'];

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService,
    private authService: AuthServiceService,
    private folderService: FolderService,
    private actividadService: ActividadService,
    private ipService: IpserviceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.panelOpenState = true;
    this.route.queryParams.subscribe(params => {
      if(params['number']  !== undefined){
        const folderId: string = params['number'];
        this.selectedFolderIdfromFavorites = folderId.toString();
      }else{
        this.selectedFolderIdfromFavorites = "";
      }

      if(params['string']  !== undefined){
        const foldername: string = params['string'];
        this.inputlabelfolder = foldername;
      }

    });

    // Carga la lista de folders desde el FolderService
    const userId = this.authService.obtenerIdUsuario();
    if (userId) {
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
  }
  fileprivacys: fileprivacy[] = [
    {valuex: 'publico', viewValue: 'Publico'},
    {valuex: 'privado', viewValue: 'Privado'},
    {valuex: 'restringido', viewValue: 'Restringido'},
  ];

  cargaralmacenamiento(){
    const userId = this.authService.obtenerIdUsuario();
    this.fileService.getStorageUsedByUser(parseInt(userId || '0')).subscribe(
      response => {
        if (response.data.length < 3) {
          throw new Error("El string debe tener al menos tres caracteres.");
        }
        // Quita los últimos tres caracteres
        const modifiedString = response.data.slice(0, -3);
        // Convierte el string a un número
        const numberValue = Number(modifiedString);
        // Verifica si la conversión fue exitosa
        if (isNaN(numberValue)) {
            throw new Error("El string modificado no se pudo convertir a un número.");
        }
        this.storageUsed = numberValue;
        // Manejar la respuesta de éxito aquí
        console.log('Storage',response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar Storage', error);
      }
    );
  }

  onSelect(event: any) {
    if(this.selectedFolderIdfromFavorites !== ""){
      this.selectedFolderId = this.selectedFolderIdfromFavorites;
    }
    if(this.storageUsed > 999999){
      this.stringerror = 'Espacio maximo alcanzado.';
      this.mostrarMensajeRegistroError();
      return;
    }

    const filesToAdd: File[] = [];
    for (const file of event.addedFiles) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (this.allowedFileFormats.includes(fileExtension || '')) {
        filesToAdd.push(file);
      } else {
        this.stringerror = `El formato de archivo ${fileExtension} no es aceptado.`;
        this.mostrarMensajeRegistroError();
        console.error(`El formato de archivo ${fileExtension} no es aceptado.`);
        return;
      }
    }

    this.files.push(...event.addedFiles);
    console.log("holi event:"+event.addedFiles[0]);

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
      this.stringerror = 'Ingrese el tipo de privacidad.';
      return;
    }

    const fileToUpload = event.addedFiles[0]; // Toma el primer archivo añadido

    // Obtener la IP del usuario utilizando el IpService
    this.ipService.getIp().subscribe({
      next: (ipResponse) => {
        const ip = ipResponse.ip;

        // Aquí, registra la actividad de subida de archivo
        const actividadData = {
          nombre: "Subida de Archivo",
          ip: ip,
          tipoActividad: "Subida",
          usuarioId: userId
        };

        this.actividadService.crearActividad(actividadData).subscribe({
          next: (resp) => {
            console.log('Actividad registrada con éxito', resp);

            // Continuar con la subida del archivo después de registrar la actividad
            const data = {
              title: "titulo",
              description: "description",
              etag: "etag",
              accessType: this.accessType.value,
              password: this.password.value, // Asegura la gestión segura de esto
              createdDate: new Date().toISOString(),
              modifiedDate: new Date().toISOString(),
              categoria: this.selectedCategory,
              deleted: false,
              userId: userId,
              folderId: this.selectedFolderId,
            };

            this.fileService.uploadFile(this.selectedFolderId, fileToUpload, data).subscribe({
              next: (response) => console.log('File uploaded successfully', response, this.mostrarMensajeRegistroExito()),
              error: (error) => console.error('Error uploading file', error," data:" ,data,"this folder",this.selectedFolderId, this.mostrarMensajeRegistroExito())
            });
          },
          error: (err) => console.error('Error al registrar actividad', err)
        });
      },
      error: (err) => {
        console.error('Error obteniendo IP del usuario', err);
        // Considera cómo manejar este caso. ¿Quieres continuar con la subida del archivo sin registrar la IP?
      }
    });
    const files: File[] = event.addedFiles;
    files.forEach(file => {
      const upload: FileUpload = {
        name: file.name,
        progress: 0, // Inicializa el progreso en 0
        size: this.formatBytes(file.size),
      };
      this.filesInProcess.push(upload);
      this.simulateUpload(file, upload); // Simula la carga
    });
  }

  gotofolder(){
    setTimeout(() => {
      this.router.navigate(['/cloud/favorites'], { queryParams: { number: this.selectedFolderId } });
    }, 2000);

  }

  onRemove(event: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  displayFn(user: User): any {
    if(user && user.id){
      this.selectedFolderId = user.id.toString();
    }
    return user && user.name ? user.name : "";
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  mostrarAlerta = false;
  mostrarAlertaError = false;
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
  cerrarAlerta() {
    this.mostrarAlerta = false;
    this.mostrarAlertaError = false;
  }

  simulateUpload(file: File, upload: FileUpload): void {
    // Simula la actualización del progreso de la carga
    const interval = setInterval(() => {
      if(upload.progress < 100) {
        upload.progress += 5; // Incrementa el progreso
      } else {
        clearInterval(interval);
        this.uploadedFiles.push(upload); // Mueve el archivo a la lista de subidos
        this.filesInProcess = this.filesInProcess.filter(item => item !== upload); // Remueve de la lista de procesamiento
        this.gotofolder();
      }
    }, 200); // Ajusta este valor según necesites
  }

  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}
