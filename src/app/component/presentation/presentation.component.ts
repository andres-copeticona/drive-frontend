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
import { ActivatedRoute, Router } from '@angular/router';
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
import { ActividadcompartidoService } from '../../service/actividadcompartido.service';

@Component({
  selector: 'app-presentation',
  standalone: true,
  imports: [
    MatAutocompleteModule,CommonModule,MatTooltipModule,MatSelectModule,
    AsyncPipe,MatDialogActions,MatDialogClose,ReactiveFormsModule,FormsModule, MatFormFieldModule, MatInputModule,NgxExtendedPdfViewerModule,NgxDocViewerModule,MatDialogTitle, MatDialogContent, MatButtonModule, MatDividerModule, MatIconModule, FormatDatePipe, TruncateDocumentNamePipe],

  templateUrl: './presentation.component.html',
  styleUrl: './presentation.component.css'
})
export class PresentationComponent implements OnInit{
  itemfile: any = {
    id: 0,
    title: "",
    description: "",
    etag: "",
    accessType: "",
    createdDate: "",
    modifiedDate: "",
    deleted: false,
    userId: 0,
    folderId: 0,
    password: "",
    minioLink: "",
    categoria: "",
    size: null,
    fileType: null,
  }
  baseurl: string = enviroment.ANGULAR_URL;
  selectedFolderId!: string;
  myControl = new FormControl<string | User>('');
  options: any[] = [];
  filteredOptions?: Observable<User[]>;
  description = new FormControl('');
  receptor = new FormControl('');
  auxResponse!: any;
  public qrString: string = "Firmado";
  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private fileService: FileService,
  private actividadService: ActividadService,
  private acticidadCompartidoService: ActividadcompartidoService,
  private qrService: QrServiceService,
  public userService: UsuarioService,
  private ipService: IpserviceService,) {}

  fileidentifier: number = 0;
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if(params['code']){

      this.fileidentifier = params['code'];
      this.obtenerdatosfile();
      }
    });
  }
  cargarunavista(){
    const actividadData = {
      idArchivo: this.itemfile.id,
      idFolder: 0,
      idUsuario: 0,
      nombre: this.itemfile.title,
      tipo: "Archivo",
    }
    this.acticidadCompartidoService.createActividadCompartido(actividadData).subscribe({
      next: (respuesta) => {
        console.log('Respuesta recibida:', respuesta); // Imprimir la respuesta recibida
        // Manejar la respuesta de éxito aquí
      },
      error: (error) => {
        console.error('Error al crear la actividad', error);
        // Manejar el error aquí
      }
    });
  }

  obtenerdatosfile(){
    this.fileService.getFileById(this.fileidentifier).subscribe({
      next: (response) => {
        console.log('File loaded successfully:', response);
        this.itemfile = response;
        this.cargarunavista();
      },
      error: (error) => console.error('Error loading file', error)
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

