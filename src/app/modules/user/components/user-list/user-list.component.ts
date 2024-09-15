import { Component, OnInit, ViewChild } from '@angular/core';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import { User } from '@app/shared/models/user.model';

@Component({
  selector: 'app-user-list',
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
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit {
  selected = 'option2';

  rol = new FormControl(0, [Validators.required]);

  rolesForEdit: { [key: number]: boolean } = {};

  displayedColumns: string[] = [
    'usuarioId',
    'nombre',
    'celular',
    'cargo',
    'estado',
    'dependencia',
    'rol',
    'edit-rol',
    'view-details',
  ];
  dataSource!: MatTableDataSource<User>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  users: User[] = [];

  filters = {
    searchTerm: '',
    page: 0,
    size: 5,
  };

  constructor(
    private userService: UserService,
    private router: Router,
    private ts: ToastrService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  async load() {
    try {
      const res = await this.userService.findMany({
        params: new HttpParams({ fromObject: this.filters }),
      });
      this.users = res?.data?.data ?? [];
      this.dataSource = new MatTableDataSource(this.users);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.paginator.length = res?.data?.total ?? 0;
    } catch (error) {
      console.error(error);
      this.ts.error('Error al mostrar usuarios', 'Error');
    }
  }

  onPageChange(event: PageEvent) {
    this.filters.page = event.pageIndex;
    this.filters.size = event.pageSize;
    this.load();
  }

  applyFilter(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filters.searchTerm = filterValue.trim().toLowerCase();
    this.load();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onRolEditChange(event: MatSlideToggleChange, id: number) {
    if (event.checked) this.rolesForEdit[id] = true;
    else delete this.rolesForEdit[id];
  }

  async applyRol(element: User) {
    try {
      const rolId = this.rol.value ?? -1;

      if (rolId === -1) return this.ts.error('Seleccione un rol', 'Error');

      await this.userService.updateRole(element.id, rolId);
      this.ts.success('Rol actualizado', 'Exito');
      return this.load();
    } catch (error) {
      console.error(error);
      this.ts.error('Error al actualizar rol', 'Error');
    }
  }

  view(id: number) {
    this.router.navigate(['/cloud/profile'], {
      queryParams: { number: id },
    });
  }
}
