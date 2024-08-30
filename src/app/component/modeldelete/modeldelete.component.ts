import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogActions,
} from '@angular/material/dialog';
import { DialogData } from '../home/home.component';
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
import { FolderService } from '../../service/folder.service';

@Component({
  selector: 'app-modeldelete',
  standalone: true,
  imports: [MatDialogActions,MatDialogClose,ReactiveFormsModule,FormsModule, MatFormFieldModule, MatInputModule,NgxExtendedPdfViewerModule,NgxDocViewerModule,MatDialogTitle, MatDialogContent, MatButtonModule, MatDividerModule, MatIconModule, FormatDatePipe, TruncateDocumentNamePipe],
  templateUrl: './modeldelete.component.html',
  styleUrl: './modeldelete.component.css'
})
export class ModeldeleteComponent implements OnInit{

  audioUrl: string = this.data.img;
  description = new FormControl('');
  url:string = this.data.img;
  public qrString: string = "Firmado";
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
  private router: Router,
  private fileService: FileService,
  private actividadService: ActividadService,
  private ipService: IpserviceService,public folderService: FolderService) {}

  ngOnInit() {
    //await this.modifyPdf();
    this.description= new FormControl('Firmado');
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
            console.log('Actividad registrada con éxito', resp);

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

  async modifyPdf() {
    // Paso 1: Obtener el PDF
    const pdfUrl = this.data.img;
    const pdfResponse = await fetch(pdfUrl);
    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF cargado: ',pdfArrayBuffer);

    // Paso 2: Generar la imagen del código QR
    const qrCodeDataUri = QRCode.toDataURL(this.description.value || 'Firmado');

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

    // Paso 4: Mostrar o Descargar el PDF Modificado
    // Ejemplo para descargar el PDF modificado
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


  eliminarfolder() {
      // Primero, obtener la IP del usuario e iniciar la creación de la actividad
      this.ipService.getIp().subscribe({
          next: (ipResponse) => {
              const ip = ipResponse.ip;

              // Preparar datos de la actividad
              const actividadData = {
                  nombre: "Eliminar Folder",
                  ip: ip,
                  tipoActividad: "Eliminación",
                  usuarioId: this.data.iduser
              };

              // Crear la actividad
              this.actividadService.crearActividad(actividadData).subscribe({
                  next: (resp) => {
                      console.log('Actividad registrada con éxito', resp);
                      // Una vez registrada la actividad, proceder a eliminar el archivo
                      this.folderService.detelefolder(this.data.name).subscribe({
                        next: (response) => {
                          console.log('Folder deleted successfully: ', response);
                          this.navegarSegunPrivacidad();
                        },
                        error: (error) => {
                          console.error('Error deleting folder', error);
                          this.navegarSegunPrivacidad();
                        }
                      });
                  },
                  error: (err) => {
                      console.error('Error al registrar actividad', err);
                      // Aquí puedes decidir si aún quieres intentar eliminar el archivo o no
                      this.folderService.detelefolder(this.data.name).subscribe({
                        next: (response) => {
                          console.log('Folder deleted successfully: ', response, this.data.name);
                          this.navegarSegunPrivacidad();
                        },
                        error: (error) => {
                          console.error('Error deleting folder', error);
                          this.navegarSegunPrivacidad();
                        }
                      });
                  }
              });
          },
          error: (err) => {
              console.error('Error obteniendo IP del usuario', err);
          }
      });
  }

  eliminarArchivo() {
    // Primero, obtener la IP del usuario e iniciar la creación de la actividad
    this.ipService.getIp().subscribe({
        next: (ipResponse) => {
            const ip = ipResponse.ip;

            // Preparar datos de la actividad
            const actividadData = {
                nombre: "Eliminar Archivo",
                ip: ip,
                tipoActividad: "Eliminación",
                usuarioId: this.data.iduser
            };

            // Crear la actividad
            this.actividadService.crearActividad(actividadData).subscribe({
                next: (resp) => {
                    console.log('Actividad registrada con éxito', resp);

                    // Una vez registrada la actividad, proceder a eliminar el archivo
                    this.fileService.deleteFile(this.data.id).subscribe({
                        next: (response) => {
                            console.log('File deleted successfully: ', response);
                            this.navegarSegunPrivacidad();
                        },
                        error: (error) => {
                            console.error('Error deleting file', error);
                            this.navegarSegunPrivacidad();
                        }
                    });
                },
                error: (err) => {
                    console.error('Error al registrar actividad', err);
                    // Aquí puedes decidir si aún quieres intentar eliminar el archivo o no
                    this.fileService.deleteFile(this.data.id).subscribe({
                        next: (response) => {
                            console.log('File deleted successfully: ', response);
                            this.navegarSegunPrivacidad();
                        },
                        error: (error) => {
                            console.error('Error deleting file', error);
                            this.navegarSegunPrivacidad();
                        }
                    });
                }
            });
        },
        error: (err) => {
            console.error('Error obteniendo IP del usuario', err);
            // Considera cómo manejar este caso. ¿Quieres continuar con la eliminación del archivo sin registrar la IP?
        }
    });
}

  navegarSegunPrivacidad() {
      if (this.data.privacy == "home") {
          this.router.navigate(['/cloud/home'], { queryParams: { number: 1 } });
      } else if (this.data.privacy == "folders") {
          this.router.navigate(['/cloud/favorites'], { queryParams: { number: 1 } });
      }
  }



  uploadfile(fileToModify: File){
    // Asumiendo que el servicio IpService ya ha sido inyectado e implementado
    this.ipService.getIp().subscribe({
      next: (ipResponse) => {
        const ip = ipResponse.ip;

        // Registro de la actividad antes de la subida del archivo
        const actividadData = {
          nombre: "Subir Archivo",
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
