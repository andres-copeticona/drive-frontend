import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { DialogData } from '../home/home.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FolderService } from '../../service/folder.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../service/usuario.service';
import { ActividadService } from '../../service/actividad.service';
import { IpserviceService } from '../../service/ipservice.service';
import { ActivatedRoute, Router } from '@angular/router';

import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import { title } from 'process';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { AuthServiceService } from '../../service/auth-service.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { set } from 'date-fns';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

export interface User {
  name: string;
  id: number;
}

@Component({
  selector: 'app-modelfolder',
  standalone: true,
  imports: [MatSlideToggleModule,AsyncPipe,FormsModule,MatSelectModule,MatAutocompleteModule,ReactiveFormsModule,MatDialogTitle, MatDialogContent,MatButtonModule, MatDividerModule, MatIconModule,MatFormFieldModule, MatInputModule],
  templateUrl: './modelfolder.component.html',
  styleUrl: './modelfolder.component.css'
})
export class ModelfolderComponent implements OnInit{
  stringerror = 'Hubo un error';
  checked = false;
  disabled = false;
  userId: number = 0;
  mostrarAlertaExito = false;
  mostrarAlertaError = false;
  folderfrombefore!: string;

  myControl = new FormControl<string | User>('');
  options: any[] = [];
  filteredOptions?: Observable<User[]>;

  selectedFolderId!: string;

  folderName = new FormControl('');
  constructor(
    private authService: AuthServiceService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private usuarioService: UsuarioService,
    public fb: FormBuilder,
    public folderService: FolderService,
    private actividadService: ActividadService,
    private ipService: IpserviceService,
    private dialogRef: MatDialogRef<ModelfolderComponent>
    ) {}

  ngOnInit(): void {
    this.checked = false;
    this.disabled = false;

    if(this.data.id || this.data.id === 0){
      this.selectedFolderId = this.data.id.toString();
      this.folderfrombefore = this.data.name;
    }else{
      this.folderfrombefore = "Nombre del folder padre";
    }

    this.usuarioService.obtenerDatosUsuario().subscribe({
      next: (respuesta) => {
        this.userId = respuesta.data.usuarioID;
      },
      error: (error) => {
        console.error('Error al obtener los datos del usuario', error);
      }
    });

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

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  registrarCustodio() {
    if (!this.folderName.value) {
      this.mostrarMensajeError();
      this.stringerror = 'Ingrese nombre de la carpeta.';
      console.error('nombre is required.');
      return;
    } else {
      let folderName = this.folderName.value;

      if (this.data.id || this.data.id !== 0) {
        this.selectedFolderId = this.data.id.toString();
        this.folderfrombefore = this.data.name;
      }

      if (this.userId !== 0) {
        // Primero obtén la IP del usuario
        this.ipService.getIp().subscribe({
          next: (ipResponse) => {
            const ip = ipResponse.ip;
            // Luego registra la actividad
            const actividadData = {
              nombre: "Creación de Carpeta",
              ip: ip,
              tipoActividad: "Creación",
              usuarioId: this.userId
            };

            this.actividadService.crearActividad(actividadData).subscribe({
              next: (resp) => {
                if (this.data.id === 0) {
                  this.folderService.registerNewFolder1(folderName, this.userId).subscribe(
                    response => {
                      this.mostrarMensajeExito();
                      this.router.navigate(['/cloud/favorites'], { queryParams: { number: 1 } });
                      this.cerrarDialogo();
                    },
                    error => {
                      this.mostrarMensajeError();
                    }
                  );
                } else {
                  this.folderService.registerNewFolder1(folderName, this.userId, this.selectedFolderId).subscribe(
                    response => {
                      console.log('Folder creado exitosamente', response);
                      this.mostrarMensajeExito();
                      this.router.navigate(['/cloud/favorites'], { queryParams: { number: 2 } });
                      this.cerrarDialogo();
                    },
                    error => {
                      console.error('Error al crear folder', error);
                      this.mostrarMensajeError();
                    }
                  );
                }
                console.log('Actividad registrada con éxito', resp);
              },
              error: (err) => {
                console.error('Error al registrar actividad', err);
                this.mostrarMensajeError();
              }
            });
          },
          error: (err) => {
            this.mostrarMensajeError();
          }
        });
      } else {
        this.mostrarMensajeError();
      }
    }
  }


  cerrarDialogo(): void{
    this.dialogRef.close();
  }

  mostrarMensajeExito() {
    this.mostrarAlertaExito = true;
    setTimeout(() => {
      this.mostrarAlertaExito = false;
    }, 3000);
  }
  displayFn(user: User): any {
    if(user && user.id){
      this.selectedFolderId = user.id.toString();
      console.log(this.selectedFolderId);
    }
    return user && user.name ? user.name : "";
  }

  mostrarMensajeError() {
    this.mostrarAlertaError = true;
    setTimeout(() => {
      this.mostrarAlertaError = false;
    }, 3000);
  }

}
