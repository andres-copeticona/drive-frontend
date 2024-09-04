import { Component, OnInit, Signal, computed } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuarioService } from '../../service/usuario.service';
import { Observable, of } from 'rxjs';
import { AuthServiceService } from '../../service/auth-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ModellogoutComponent } from '../modellogout/modellogout.component';
import { MatMenuModule } from '@angular/material/menu';

export type MenuItem = {
  icon: string;
  label: string;
  route: string;
};

@Component({
  selector: 'app-navigation-admin',
  standalone: true,
  imports: [
    MatMenuModule,
    MatTooltipModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
    MatCheckboxModule,
    FormsModule,
  ],
  templateUrl: './navigation-admin.component.html',
  styleUrl: './navigation-admin.component.css',
})
export class NavigationAdminComponent implements OnInit {
  opened: boolean = true;
  userList$!: Observable<any[]>;
  rol: any;
  openSideNav() {
    this.opened = this.opened ? false : true;
  }
  menuItem1: MenuItem = { icon: 'home', label: 'Home', route: '/' };
  menuItems: Signal<MenuItem[]> = signal([
    { icon: 'home', label: 'Home', route: '/' },
    { icon: 'folder', label: 'Files', route: '/files' },
    { icon: 'settings', label: 'Settings', route: '/settings' },
  ]);

  constructor(
    private router: Router,
    public usuarioService: UsuarioService,
    private authService: AuthServiceService,
    public dialog: MatDialog,
  ) {}
  ngOnInit(): void {
    this.userList$ = of([]);
    this.obtenerusers();

    if (localStorage.getItem('userId') || localStorage.getItem('userRole')) {
      console.log('Usuario logueado');
    } else {
      console.log('Usuario no logueado');

      this.router.navigate(['/']);
    }
  }

  openDialogLogout() {
    //Esto es para que ya no redireccione a home
    //this.router.navigate(['/cloud/home']);
    this.dialog.open(ModellogoutComponent, {
      data: {},
    });
  }

  logout() {
    this.openDialogLogout();
  }

  //Este metodo te controla que tengas el rol de administrador
  obtenerusers() {
    const userId = this.authService.obtenerIdUsuario();
    this.usuarioService.getAllUsers().subscribe(
      (response) => {
        this.userList$.subscribe(() => {
          this.userList$ = of(response.data.content);
          for (let i = 0; i < response.data.content.length; i++) {
            if (response.data.content[i].usuarioID == userId) {
              console.log(
                'Rol del user',
                response.data.content[i].roles[0].rolID,
              );
              this.rol = response.data.content[i].roles[0].rolID;
            }
          }
        });
        // Manejar la respuesta de éxito aquí
        console.log('Registros de usuarios', response.data.content[0].nombre);
      },
      (error) => {
        // Manejar el error aquí
        console.error('Error al mostrar usuarios', error);
      },
    );
  }

  collapsed = signal(true);
  sidenavwidth = computed(() => (this.collapsed() ? '65px' : '250px'));
  profilepicsize = computed(() => (this.collapsed() ? '32' : '100'));
}
