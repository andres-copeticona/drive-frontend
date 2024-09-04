import { Component, computed } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

export type MenuItem = {
  icon: string;
  label: string;
  route: string;
};

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
    MatCheckboxModule,
    FormsModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  opened: boolean = true;
  openSideNav() {
    this.opened = this.opened ? false : true;
  }
  menuItem1: MenuItem = { icon: 'home', label: 'Home', route: '/' };
  menuItems: MenuItem[] = [
    { icon: 'home', label: 'Home', route: '/' },
    { icon: 'folder', label: 'Files', route: '/files' },
    { icon: 'settings', label: 'Settings', route: '/settings' },
  ];

  constructor() {}

  // logout() {
  //   // Limpia el almacenamiento local o la sesión donde guardas el token de autenticación
  //   localStorage.removeItem('token');
  //   // Navega de vuelta a la pantalla de login
  //   this.router.navigate(['/']);
  // }

  collapsed = signal(true);
  sidenavwidth = computed(() => (this.collapsed() ? '65px' : '250px'));
  profilepicsize = computed(() => (this.collapsed() ? '32' : '100'));
}
