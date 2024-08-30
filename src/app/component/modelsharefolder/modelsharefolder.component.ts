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
import { FolderService } from '../../service/folder.service';
import { Router } from '@angular/router';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { IpserviceService } from '../../service/ipservice.service';
import { ActividadService } from '../../service/actividad.service';
import {MatExpansionModule} from '@angular/material/expansion';
import { enviroment } from '../../../environments/enviroment';
interface fileprivacy {
  valuex: string;
  viewValue: string;
}
@Component({
  selector: 'app-modelsharefolder',
  standalone: true,
  imports: [MatExpansionModule,MatButtonToggleModule,MatCardModule,MatMenuModule,MatTooltipModule,MatSelectModule,AsyncPipe,CommonModule,FormsModule,ReactiveFormsModule,MatAutocompleteModule,MatDialogClose,MatDialogActions,QRCodeModule,MatDialogTitle, MatDialogContent,MatButtonModule, MatDividerModule, MatIconModule,MatFormFieldModule, MatInputModule],
  templateUrl: './modelsharefolder.component.html',
  styleUrl: './modelsharefolder.component.css'
})
export class ModelsharefolderComponent implements OnInit {
  textToCopy: string = '';
  panelOpenState = false;
  typeofshareControl = new FormControl('');
  fontStyle?: string;
  selectedFolderId!: string;
  selectedDependencyName!: string;
  accessType= new FormControl('');
  accessTypes: string[] = ['publico', 'privado', 'restringido'];
  public myAngularxQrCode: string = "null";
  myControl = new FormControl<string | User>('');
  options: any[] = [];
  filteredOptions?: Observable<User[]>;

  myControldependency = new FormControl<string | User>('');
  optionsdependency: any[] = [];
  filteredOptionsdependency?: Observable<User[]>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
    public sharingService: ShareService,
    public userService: UsuarioService,
    public folderService: FolderService,
    private ipService: IpserviceService,
    private actividadService: ActividadService,
    private router: Router
  ) {
    // assign a link to the QR code
    this.myAngularxQrCode = enviroment.ANGULAR_URL+"/folder?str="+data.name+"&codeid="+data.idperson+"&code="+data.id;
    this.textToCopy = enviroment.ANGULAR_URL+"/folder?str="+data.name+"&codeid="+data.idperson+"&code="+data.id;
  }
  ngOnInit(): void {

    this.userService.getAllUsers().pipe(
      map(response => response.data.content),
      catchError(error => {
        return of([]); // Return an empty observable in case of error
      })
    ).subscribe(users => {
      this.options = users;
    });
    this.folderService.getAllDependencies().pipe(
      map(response => response.data),
      catchError(error => {
        return of([]); // Return an empty observable in case of error
      })
    ).subscribe(dependency => {
      this.optionsdependency = dependency as string[];
      console.log("lets seeee: ", this.optionsdependency, ":::", dependency);
    });

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.nombres;
        this.selectedFolderId = typeof value === 'string' ? value : value?.usuarioID.toString() || '';
        return name ? this._filter(name as string) : this.options.slice();
      }),
    );

    this.filteredOptionsdependency = this.myControldependency.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value;
        this.selectedDependencyName = typeof value === 'string' ? value : value?.toString() || '';
        return name ? this._filterdependency(name as string) : this.optionsdependency.slice();
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

  copyText() {
    if (this.textToCopy) {
      navigator.clipboard.writeText(this.textToCopy).then(() => {
        console.log('Texto copiado: ', this.textToCopy);
        alert('Texto copiado al portapapeles');
      }).catch(err => {
        console.error('Error al copiar el texto: ', err);
      });
    }
  }

  displayFndependency(user: User): any {
    if(user){
      this.selectedDependencyName = user.toString();
      console.log(this.selectedDependencyName);
    }
    return user;
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.options.filter(option => option.nombres.toLowerCase().includes(filterValue));
  }

  private _filterdependency(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.optionsdependency.filter(option => option.toLowerCase().includes(filterValue));
  }

  fileprivacys: fileprivacy[] = [
    {valuex: 'publico', viewValue: 'Publico'},
    {valuex: 'privado', viewValue: 'Privado'},
    {valuex: 'restringido', viewValue: 'Restringido'},
  ];

  compartir() {
    this.ipService.getIp().subscribe({
        next: (ipResponse) => {
            const ip = ipResponse.ip;
            const actividadData = {
                nombre: "Compartir Carpeta",
                ip: ip,
                tipoActividad: "Compartir",
                usuarioId: parseInt(this.data?.iduser || '0', 10)
            };

            this.actividadService.crearActividad(actividadData).subscribe({
                next: (resp) => {

                    const folderId = this.data?.id || 0;
                    const emisorUsuarioId = parseInt(this.data?.iduser || '0', 10);
                    const receptorId = parseInt(this.selectedFolderId, 10);
                    this.folderService.shareFolder(folderId, emisorUsuarioId, receptorId).subscribe({
                        next: (response) => {
                            console.log('File shared user successfully:', response.message);
                            this.router.navigate(['/cloud/favorites'], { queryParams: { number: 1 } });
                        },
                        error: (error) => {
                            console.error('Error sharing user file:', error, folderId, receptorId, emisorUsuarioId);
                            this.router.navigate(['/cloud/favorites'], { queryParams: { number: 1 } });
                        }
                    });
                },
                error: (err) => {
                    console.error('Error al registrar actividad', err);
                }
            });
        },
        error: (err) => {
            console.error('Error obteniendo IP del usuario', err);
        }
    });
}


compartirdependencia() {
  this.ipService.getIp().subscribe({
      next: (ipResponse) => {
          const ip = ipResponse.ip;
          const actividadData = {
              nombre: "Compartir Carpeta con Dependencia",
              ip: ip,
              tipoActividad: "Compartir",
              usuarioId: parseInt(this.data?.iduser || '0', 10)
          };

          this.actividadService.crearActividad(actividadData).subscribe({
              next: (resp) => {
                  console.log('Actividad registrada con éxito', resp);

                  const dependenciaNombre = this.selectedDependencyName;
                  const folderId = this.data?.id || 0;
                  this.folderService.shareFolderWithUsersByDependency(dependenciaNombre, folderId).subscribe({
                      next: (response) => {
                          console.log('File shared dependency successfully:', response.message);
                          this.router.navigate(['/cloud/favorites'], { queryParams: { number: 1 } });
                      },
                      error: (error) => {
                          console.error('Error sharing dependency file:', error, folderId);
                          this.router.navigate(['/cloud/favorites'], { queryParams: { number: 1 } });
                      }
                  });
              },
              error: (err) => {
                  console.error('Error al registrar actividad', err);
              }
          });
      },
      error: (err) => {
          console.error('Error obteniendo IP del usuario', err);
      }
  });
}


compartirall() {
  this.ipService.getIp().subscribe({
      next: (ipResponse) => {
          const ip = ipResponse.ip;
          const actividadData = {
              nombre: "Compartir Carpeta con Todos",
              ip: ip,
              tipoActividad: "Compartir",
              usuarioId: parseInt(this.data?.iduser || '0', 10)
          };

          this.actividadService.crearActividad(actividadData).subscribe({
              next: (resp) => {
                  console.log('Actividad registrada con éxito', resp);

                  const folderId = this.data?.id || 0;
                  this.folderService.shareFolderWithAllUsers(folderId).subscribe({
                      next: (response) => {
                          console.log('File shared for all successfully:', response.message);
                          this.router.navigate(['/cloud/favorites'], { queryParams: { number: 1 } });
                      },
                      error: (error) => {
                          console.error('Error sharing for all file:', error, folderId);
                          this.router.navigate(['/cloud/favorites'], { queryParams: { number: 1 } });
                      }
                  });
              },
              error: (err) => {
                  console.error('Error al registrar actividad', err);
              }
          });
      },
      error: (err) => {
          console.error('Error obteniendo IP del usuario', err);
      }
  });
}

}
