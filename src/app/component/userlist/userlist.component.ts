import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Observable, of } from 'rxjs';
import { UsuarioService } from '../../service/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { set } from 'date-fns';

import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export interface UserData {
  id: number;
  nombre: string;
  celular: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-userlist',
  standalone: true,
  imports: [
    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    AsyncPipe,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  templateUrl: './userlist.component.html',
  styleUrl: './userlist.component.css',
})
export class UserlistComponent implements OnInit {
  selected = 'option2';
  rol = new FormControl(0, [Validators.required]);

  slideemploy!: any[];
  displayedColumns: string[] = [
    'id',
    'nombre',
    'celular',
    'email',
    'status',
    'fechacreacion',
    'fechaactualizacion',
    'edit',
    'rol',
  ];
  dataSource!: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  userList$!: Observable<any[]>;
  rolList$!: Observable<any[]>;

  constructor(
    private router: Router,
    public usuarioService: UsuarioService,
  ) {
    setTimeout(() => {
      this.usuarioService.getAllUsers().subscribe(
        (response) => {
          this.userList$.subscribe(() => {
            this.userList$ = of(response.data.content);
          });
        },
        (error) => {
          // Manejar el error aquí
          console.error('Error al mostrar usuarios', error);
        },
      );
      this.userList$.subscribe((data: any[]) => {
        this.dataSource = new MatTableDataSource(data);
      });
    }, 1000);
  }

  ngOnInit(): void {
    this.rolList$ = of([]);
    this.slideemploy = [];
    this.userList$ = of([]);
    this.cargardatos();

    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }, 1000);
  }

  enterprofile(id: number) {
    this.router.navigate(['/cloud/perfiluserselected'], {
      queryParams: { number: id },
    });
  }
  actualizarrol(id: number) {
    const newrol = this.rol.value;
    if (newrol !== null) {
      this.usuarioService.cambiarRolUsuario(id, newrol).subscribe({
        next: (response) => {
          this.mostrarMensajeDeleteExito();
          console.log('Respuesta del servidor:', response); // Para propósitos de depuración
          setTimeout(() => {
            this.cargardatos();
            for (let i = 0; i < this.slideemploy.length; i++) {
              this.slideemploy[i] = false;
            }
          }, 500);

          // Ajustamos según la respuesta real esperada
          // Suponiendo que la respuesta contiene directamente los datos del usuario necesarios
        },
        error: (error) => {
          console.error(error + ' Rol no cambiado: '); // Para propósitos de depuración
          this.mostrarMensajeDeleteError();
        },
      });
    }
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  cargardatos() {
    this.usuarioService.getAllUsers().subscribe(
      (response) => {
        this.userList$.subscribe(() => {
          this.userList$ = of(response.data.content);
        });
        // Manejar la respuesta de éxito aquí
        console.log('Registros de usuarios', response.data.content[0].nombre);
      },
      (error) => {
        // Manejar el error aquí
        console.error('Error al mostrar usuarios', error);
      },
    );
    setTimeout(() => {
      this.userList$.subscribe((data: any[]) => {
        this.dataSource = new MatTableDataSource(data);
      });
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }, 1000);
    this.usuarioService.obtenerRoles().subscribe(
      (response) => {
        this.rolList$.subscribe(() => {
          this.rolList$ = of(response);
        });
        // Manejar la respuesta de éxito aquí
        console.log('Registros de roles', response);
      },
      (error) => {
        // Manejar el error aquí
        console.error('Error al mostrar roles', error);
      },
    );
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
  cerrarAlerta() {
    this.mostrarAlerta = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaDelete = false;
    this.mostrarAlertaErrorDelete = false;
  }
}
