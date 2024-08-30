import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogActions,
} from '@angular/material/dialog';
import { DialogData, User } from '../home/home.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { FormatDatePipe } from "../../pipes/format-date.pipe";
import { TruncateDocumentNamePipe } from "../../pipes/truncate-document-name.pipe";
import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { FileService } from '../../service/file.service';
import { ActividadService } from '../../service/actividad.service';
import { IpserviceService } from '../../service/ipservice.service';
import { Router } from '@angular/router';
import { QrServiceService } from '../../service/qr-service.service';

import {Observable, of} from 'rxjs';
import {catchError, map, startWith} from 'rxjs/operators';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { UsuarioService } from '../../service/usuario.service';

import { CommonModule } from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import { enviroment } from '../../../environments/enviroment';

@Component({
  selector: 'app-modelpdfview',
  standalone: true,
  imports: [
    MatAutocompleteModule,CommonModule,MatTooltipModule,MatSelectModule,
    AsyncPipe,MatDialogActions,MatDialogClose,ReactiveFormsModule,FormsModule, MatFormFieldModule, MatInputModule,NgxExtendedPdfViewerModule,NgxDocViewerModule,MatDialogTitle, MatDialogContent, MatButtonModule, MatDividerModule, MatIconModule, FormatDatePipe, TruncateDocumentNamePipe],
  templateUrl: './modelpdfview.component.html',
  styleUrl: './modelpdfview.component.css'
})
export class ModelpdfviewComponent implements OnInit{

  baseurl: string = enviroment.ANGULAR_URL;
  selectedFolderId!: string;
  myControl = new FormControl<string | User>('');
  options: any[] = [];
  filteredOptions?: Observable<User[]>;
  description = new FormControl('');
  receptor = new FormControl('');
  auxResponse!: any;
  url:string = this.data.img;
  public qrString: string = "Firmado";
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
  private router: Router,
  private fileService: FileService,
  private actividadService: ActividadService,
  private qrService: QrServiceService,
  public userService: UsuarioService,
  private ipService: IpserviceService,) {}

  ngOnInit() {
    //await this.modifyPdf();
    this.description= new FormControl('Firmado');
    this.userService.getAllUsers().pipe(
      map(response => response.data.content),
      catchError(error => {
        return of([]); // Return an empty observable in case of error
      })
    ).subscribe(users => {
      this.options = users;
    });
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.nombres;
        this.selectedFolderId = typeof value === 'string' ? value : value?.usuarioID.toString() || '';
        return name ? this._filter(name as string) : this.options.slice();
      }),
    );
  }

  modificarreemplazar(){
    // Asumiendo que el servicio IpService ya ha sido inyectado e implementado
    this.ipService.getIp().subscribe({
      next: (ipResponse) => {
        const ip = ipResponse.ip;

        // Registro de la actividad antes de la subida del archivo
        const actividadData = {
          nombre: "Cambio categoria",
          ip: ip,
          tipoActividad: "Modificacion",
          usuarioId: this.data.iduser
        };

        this.actividadService.crearActividad(actividadData).subscribe({
          next: (resp) => {
            // Usar fileService para subir el archivo
            this.fileService.updateFileCategory(this.data.id, "Reemplazar").subscribe({
              next: (response) => console.log('File edited successfully', response, this.mostrarMensajeRegistroExito(), this.router.navigate(['/cloud/home'], { queryParams: { number: 1 } })),
              error: (error) => console.error('Error editing file', error,"this file",this.data.name, this.mostrarMensajeRegistroExito(),this.router.navigate(['/cloud/home'], { queryParams: { number: 1 } }))
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
  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.options.filter(option => option.nombres.toLowerCase().includes(filterValue));
  }

  displayFn(user: User): any {
    if(user && user.usuarioID){
      this.selectedFolderId = user.usuarioID.toString();
    }
    return user && user.nombres ? user.nombres : "";
  }

  prepareRoute() {
    const qr = {
      id: this.data.id || 0,
      emisor: this.data.iduser || '',
      mensaje: this.description.value || 'Firmado',
      titulo: this.data.titulo || 'Título Predeterminado', // Asegurándote de que manejas el caso donde puede no existir
      fechaCreacion: new Date(),
      codeQr: ''
    };
    this.qrService.saveQrCode(qr).subscribe({
      next: (response) => {
        console.log('QR guardado con éxito:', response);
        this.auxResponse = response.data.codeQr;
        this.modifyPdf();
      },
      error: (error) => console.error('Error guardando QR:', error)
    });
  }


  async modifyPdf() {
    // Paso 1: Obtener el PDF
    const pdfUrl = this.data.img;
    const pdfResponse = await fetch(pdfUrl);
    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    const qrCodeDataUri = QRCode.toDataURL(this.baseurl+"/detalleSello?signed="+this.auxResponse || 'Firmado');

    // Paso 3: Incrustar la imagen del código QR en el PDF
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    const qrImage = await pdfDoc.embedPng((await qrCodeDataUri).split(',')[1]); // Dividir para obtener solo la parte de datos base64

    const page = pdfDoc.getPages()[0];
    page.drawImage(qrImage, {
      x: page.getWidth() - 110, // Ajusta según necesidad
      y: 10, // Ajusta según necesidad
      width: 100,
      height: 100
    });

    // Guardar el PDF modificado
    const modifiedPdfArrayBuffer = await pdfDoc.save();

    const blob = new Blob([modifiedPdfArrayBuffer], { type: 'application/pdf' });
    // Crear un archivo file para publicarlo
    const file = new File([blob], "Sellado_"+this.data.name, { type: 'application/pdf' });
    this.uploadfile(file);
    //--
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = this.data.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log('PDF modificado guardado');
    setTimeout(() => {this.eliminarArchivo();
    }, 300);
  }

  eliminarArchivo(){
    this.fileService.deleteFile(this.data.id).subscribe({
      next: (response) => {
        console.log('File deleted successfully: ', response);

      },
      error: (error) => {
        console.error('Error deleting file', error);
      }
    });
  }

  uploadfile(fileToModify: File){
    // Asumiendo que el servicio IpService ya ha sido inyectado e implementado
    this.ipService.getIp().subscribe({
      next: (ipResponse) => {
        const ip = ipResponse.ip;

        // Registro de la actividad antes de la subida del archivo
        const actividadData = {
          nombre: "Cambio categoria",
          ip: ip,
          tipoActividad: "Modificacion",
          usuarioId: this.data.iduser
        };

        this.actividadService.crearActividad(actividadData).subscribe({
          next: (resp) => {
            console.log('Actividad registrada con éxito', resp);

            // Ahora, procede con la subida del archivo
            const fileToUpload = fileToModify; // Toma el primer archivo añadido
            const data = {
              title: "titulo",
              description: this.description.value,
              etag: "etag",
              accessType: this.data.accessType,
              password: this.data.password,
              createdDate: new Date().toISOString(),
              modifiedDate: new Date().toISOString(),
              categoria: "Sellado",
              deleted: false,
              userId: this.data.iduser,
              folderId: this.data.folderId,
            };

            // Usar fileService para subir el archivo
            this.fileService.uploadFile(this.data.folderId, fileToUpload, data).subscribe({
              next: (response) => console.log('File uploaded successfully', response, this.mostrarMensajeRegistroExito(),this.router.navigate(['/cloud/home'], { queryParams: { number: 1 } })),
              error: (error) => console.error('Error uploading file', error," data:" ,data,"this folder",this.data.folderId,fileToUpload, this.mostrarMensajeRegistroExito(),this.router.navigate(['/cloud/home'], { queryParams: { number: 1 } }))
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
}
