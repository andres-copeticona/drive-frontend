import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogClose, MatDialogActions, MatDialogTitle, MatDialogContent, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QRCodeModule } from 'angularx-qrcode';
import { DialogData } from '../home/home.component';
import { TruncatePipe } from "../../truncate.pipe";
import { Router } from '@angular/router';
import { ModelimgComponent } from '../modelimg/modelimg.component';
import { ModelpdfComponent } from '../modelpdf/modelpdf.component';
import { ModelsharingComponent } from '../modelsharing/modelsharing.component';
import { FileService } from '../../service/file.service';
import { ModelpdfviewComponent } from '../modelpdfview/modelpdfview.component';


@Component({
    selector: 'app-modelpassword',
    standalone: true,
    templateUrl: './modelpassword.component.html',
    styleUrl: './modelpassword.component.css',
    imports: [MatCardModule, MatMenuModule, MatTooltipModule, MatSelectModule, AsyncPipe, CommonModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatDialogClose, MatDialogActions, QRCodeModule, MatDialogTitle, MatDialogContent, MatButtonModule, MatDividerModule, MatIconModule, MatFormFieldModule, MatInputModule, TruncatePipe]
})
export class ModelpasswordComponent implements OnInit{
  password= new FormControl('');
  hide = true;
  constructor(public dialog: MatDialog,@Inject(MAT_DIALOG_DATA) public data: DialogData,private router: Router,private fileService: FileService,){}
  ngOnInit(): void {
  }
  acceder(){
    console.log(this.password.value, "---",this.data.password);
    if(this.password.value == this.data.password){
      if(this.data.categoria == "img"){
        this.openDialog(this.data.id, this.data.name, this.data.img, this.data.date, this.data.privacy);
      }
      if(this.data.categoria == "docview"){
        this.openDialogpdfview(this.data.id, this.data.name, this.data.img, this.data.date, this.data.privacy, this.data.iduser, this.data.description, this.data.accessType, this.data.password, this.data.description, this.data.folderId);
      }
      if(this.data.categoria == "doc"){
        this.openDialogpdf(this.data.id, this.data.name, this.data.img, this.data.date, this.data.privacy, this.data.iduser, this.data.description, this.data.accessType, this.data.password, this.data.description, this.data.folderId);
      }
      if(this.data.categoria == "delete"){
        this.deletefile(this.data.id);
      }
      if(this.data.categoria == "share"){
        this.openDialogShare(this.data.id, this.data.name, this.data.img, this.data.date, this.data.privacy, this.data.iduser, this.data.description, this.data.accessType, this.data.password, this.data.categoria, this.data.folderId);
      }   

    }else{
      this.mostrarMensajeRegistroError();
    }
  }

  openDialog(id: number, name: string, img: string, date: string, privacy: string) {
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
  openDialogpdfview(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
    this.dialog.open(ModelpdfviewComponent, {
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

  openDialogShare(id: number, name: string, img: string, date: string, privacy: string, iduser: any, description: string, accessType: string, password: string, categoria: string, folderId: string) {
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

  deletefile(id: number){
    this.fileService.deleteFile(id).subscribe({
      next: (response) => {
        console.log('File deleted successfully: ', response);
        
      },
      error: (error) => {
        console.error('Error deleting file', error);
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
