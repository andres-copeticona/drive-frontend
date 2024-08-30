import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Observable, of } from 'rxjs';
import { UsuarioService } from '../../service/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { set } from 'date-fns';

import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { AsyncPipe, NgFor } from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import { FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ActividadService } from '../../service/actividad.service';
import { ActividadcompartidoService } from '../../service/actividadcompartido.service';
import { FormatDatePipe } from "../../pipes/format-date.pipe";
import { DatePipe } from '@angular/common';

export interface UserData {
  id: number;
  nombre: string;
  fecha: string;
  ip: string;
  usuarioId: string;
  tipoActividad: string;
}
@Component({
  selector: 'app-activitycenter',
  standalone: true,
  imports: [DatePipe,FormatDatePipe,MatSlideToggleModule,ReactiveFormsModule,FormsModule,MatSelectModule,AsyncPipe,MatButtonModule,MatDividerModule,MatIconModule,MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule],
  templateUrl: './activitycenter.component.html',
  styleUrl: './activitycenter.component.css'
})
export class ActivitycenterComponent implements OnInit  {
  selected = 'option2';
  rol = new FormControl(0, [Validators.required]);
  slideemploy!: any[];
  displayedColumns: string[] = ['id', 'nombre', 'fecha', 'ip', 'usuarioId', 'tipoActividad'];

  displayedColumns2: string[] = ['nombre', 'Tipo','idArchivo', 'idFolder', 'Cantidad'];
  dataSource!: MatTableDataSource<UserData>;
  dataSource2!: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator2!: MatPaginator;
  @ViewChild(MatSort) sort2!: MatSort;
  userList$!: Observable<any[]>;
  contadorArchivosList$!: Observable<any[]>;
  rolList$!: Observable<any[]>;
  constructor(private router: Router,public usuarioService: UsuarioService,public actividadeService: ActividadService,public actividadesCompartidasService: ActividadcompartidoService) {
    setTimeout(() => {
      this.actividadeService.listActivities().subscribe(
        response => {
          this.userList$.subscribe(() => {
            this.userList$ = of(response);
          });
          // Manejar la respuesta de éxito aquí
          console.log('Registros de usuarios', response);
        },
        error => {
          // Manejar el error aquí
          console.error('Error al mostrar usuarios', error);
        }
      )
      this.userList$.subscribe((data: any[]) => {
        this.dataSource = new MatTableDataSource(data);
      });
      this.contadorArchivosList$.subscribe((data1: any[]) => {
        this.dataSource2 = new MatTableDataSource(data1);
      });
    },1000)
  }
  ngOnInit(): void {
    this.rolList$ = of([]);
    this.slideemploy = [];
    this.userList$ = of([]);
    this.contadorArchivosList$ = of([]);
    this.vercontadordearchivos();
    this.cargardatos();

    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource2.paginator = this.paginator2;
      this.dataSource2.sort = this.sort2
    },1000)

  }

  // metodo para mostrar los archivos con los contadores
  vercontadordearchivos(){
    this.actividadesCompartidasService.getArchivosContadores().subscribe(
      response => {
        this.contadorArchivosList$ = of(response);
        // Manejar la respuesta de éxito aquí
        console.log('Registros de los archivos compartidos', response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar archivos compartidos', error);
      }
    );
  }

  // metodo para mostrar el perfil de un usuario
  enterprofile(id: number){
    console.log("id es:"+id);
    this.router.navigate(['/cloud/perfiluserselected'], { queryParams: { number: id } });
  }

  // metodo para cambiar el rol de un usuario
  actualizarrol(id: number){
    const newrol = this.rol.value
    if (newrol !== null) {
      this.usuarioService.cambiarRolUsuario(id, newrol).subscribe({
        next: (response) => {
          this.mostrarMensajeDeleteExito();
          console.log('Respuesta del servidor:', response); // Para propósitos de depuración
          setTimeout(() => {
            this.cargardatos();
            for(let i = 0; i < this.slideemploy.length; i++){
              this.slideemploy[i] = false;
            }
          }, 500);

          // Ajustamos según la respuesta real esperada
          // Suponiendo que la respuesta contiene directamente los datos del usuario necesarios
        },
        error: (error) => {
          console.error(error+" Rol no cambiado: "); // Para propósitos de depuración
          this.mostrarMensajeDeleteError();
        }
      });
    }
  }

  // metodo para mostrar los roles de un usuario
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // metodo para mostrar los archivos con los contadores
  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();

    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
  }

  // metodo para mostrar los roles de un usuario y cambiarlos
  cargardatos(){
    this.actividadeService.listActivities().subscribe(
      response => {
        this.userList$.subscribe(() => {
          this.userList$ = of(response);
        });
        // Manejar la respuesta de éxito aquí
        console.log('Registros de usuarios', response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar usuarios', error);
      }
    )
    setTimeout(() => {
      this.userList$.subscribe((data: any[]) => {
        this.dataSource = new MatTableDataSource(data);
      });

      this.contadorArchivosList$.subscribe((data: any[]) => {
        this.dataSource2 = new MatTableDataSource(data);
      });
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource2.paginator = this.paginator2;
      this.dataSource2.sort = this.sort2;
    },1000)
    this.usuarioService.obtenerRoles().subscribe(
      response => {
        this.rolList$.subscribe(() => {
          this.rolList$ = of(response);
        });
        // Manejar la respuesta de éxito aquí
        console.log('Registros de roles', response);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar roles', error);
      }
    )
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

  // mostrar los mensajes de error
  mostrarMensajeRegistroError() {
    this.mostrarAlertaError = true;
    setTimeout(() => {
      this.cerrarAlerta();
    }, 3000);
  }

  // mostrar los mensajes de exito
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
