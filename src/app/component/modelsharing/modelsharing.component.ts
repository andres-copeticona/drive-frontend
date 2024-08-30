import { Component, Inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  MatDialogTitle,
  MatDialogContent,
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { DialogData, User } from '../home/home.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {QRCodeModule} from 'angularx-qrcode';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormsModule,FormControl,ReactiveFormsModule, FormGroup} from '@angular/forms';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { ShareService } from '../../service/share.service';
import { UsuarioService } from '../../service/usuario.service';

import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import { enviroment } from '../../../environments/enviroment';


interface fileprivacy {
  valuex: string;
  viewValue: string;
}

@Component({
  selector: 'app-modelsharing',
  standalone: true,
  imports: [MatExpansionModule,MatCardModule,MatMenuModule,MatTooltipModule,MatSelectModule,AsyncPipe,CommonModule,FormsModule,ReactiveFormsModule,MatAutocompleteModule,MatDialogClose,MatDialogActions,QRCodeModule,MatDialogTitle, MatDialogContent,MatButtonModule, MatDividerModule, MatIconModule,MatFormFieldModule, MatInputModule],
  templateUrl: './modelsharing.component.html',
  styleUrl: './modelsharing.component.css'
})
export class ModelsharingComponent implements OnInit{
  panelOpenState = false;
  selectedFolderId!: string;
  accessType= new FormControl('');
  accessTypes: string[] = ['publico', 'privado', 'restringido'];
  public myAngularxQrCode: string = "null";
  myControl = new FormControl<string | User>('');
  options: any[] = [];
  filteredOptions?: Observable<User[]>;
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
    public sharingService: ShareService,
    public userService: UsuarioService 
  ) {
    // assign a link to the QR code
    this.myAngularxQrCode = enviroment.ANGULAR_URL+"/file?code="+data.id;
  }
  ngOnInit(): void {
    this.options = [];
    this.userService.getAllUsers().pipe(
      map(response => response.data.content),
      catchError(error => {
        console.error('Error fetching users aa:', error);
        return of([]); // Return an empty observable in case of error
      })
    ).subscribe(users => {
      this.options = users;
      console.log('options:', this.options);
      console.log('Users:', users);
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

  displayFn(user: User): any {
    if(user && user.usuarioID){
      this.selectedFolderId = user.usuarioID.toString();
      console.log(this.selectedFolderId);
    }
    return user && user.nombres ? user.nombres : "";    
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.options.filter(option => {
      const nombres = option.nombres || ''; // Asignar una cadena vacía si nombres es null o undefined
      return nombres.toLowerCase().includes(filterValue);
    });
  }

  fileprivacys: fileprivacy[] = [
    {valuex: 'publico', viewValue: 'Publico'},
    {valuex: 'privado', viewValue: 'Privado'},
    {valuex: 'restringido', viewValue: 'Restringido'},
  ];

  compartir() {
    const documentoId = this.data?.id || 0; 
    const emisorUsuarioId = parseInt(this.data?.iduser || '0', 10);
    this.sharingService.shareDocument({
      documentoId,
      receptorUsuarioId: parseInt(this.selectedFolderId, 10), 
      emisorUsuarioId,
      tipoAcceso: this.accessType.value || "publico", 
    }).subscribe({
      next: (response) => {
        console.log('File shared successfully:', response.message);
        this.myAngularxQrCode = response.link; 
      },
      error: (error) => {
        console.error('Error sharing file:', error, documentoId, parseInt(this.selectedFolderId, 10), emisorUsuarioId, this.accessType.value);
      }
    });
  }

}
