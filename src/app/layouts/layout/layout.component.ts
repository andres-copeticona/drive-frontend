import { Component, OnInit, signal } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  BreakpointObserver,
  Breakpoints,
  LayoutModule,
} from '@angular/cdk/layout';
import { AuthService } from '@app/shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';

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
    MatTooltipModule,
    RouterModule,
    MatCheckboxModule,
    FormsModule,

    LayoutModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  opened = signal(true);
  collapsed = signal(true);
  isSmallScreen = signal(false);

  get menu() {
    if (this.authService.getInfo()?.roleId === 1) return this.rol1Menu;
    else if (this.authService.getInfo()?.roleId === 2) return this.rol2Menu;
    else {
      this.authService.logout();
      return [];
    }
  }

  rol1Menu: MenuItem[] = [
    { icon: 'account_circle', label: 'Perfil', route: '/profile' },
    { icon: 'home', label: 'Página principal', route: '/home' },

    { icon: 'folder_open', label: 'Carpetas', route: '/folders' },
    {
      icon: 'folder_shared',
      label: 'Carpetas Compartidas',
      route: '/sharedfolders',
    },
    {
      icon: 'contact_page',
      label: 'Archivos Compartidos',
      route: '/sharedFiles',
    },
    // { icon: 'settings', label: 'Archivos Firmados', route: '/signedfiles' },
    // { icon: 'settings', label: 'Pdf Preview', route: '/pdfview' },
    // { icon: 'settings', label: 'Actividad', route: '/activity' },
    //
    // { icon: 'settings', label: 'Sello', route: '/detalleSello' },
    // { icon: 'settings', label: 'Archivo', route: '/file' },
    // { icon: 'settings', label: 'Carpeta', route: '/folder' },
  ];

  rol2Menu: MenuItem[] = [
    { icon: 'account_circle', label: 'Perfil', route: '/profile' },
    { icon: 'person', label: 'Usuarios del sistema', route: '/userlist' },
    { icon: 'summarize', label: 'Reportes', route: '/activity' },
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isSmallScreen.set(result.matches);
        if (this.isSmallScreen()) {
          this.opened.set(false);
        } else {
          this.opened.set(true);
          this.collapsed.set(false);
        }
      });
  }

  sidenavWidth(): string {
    return this.isSmallScreen() ? '100%' : this.collapsed() ? '250px' : '65px';
  }

  contentWidth(): string {
    return this.isSmallScreen() ? '0' : this.collapsed() ? '250px' : '65px';
  }

  toggleSidenav(): void {
    if (this.isSmallScreen()) this.opened.set(!this.opened());
    this.collapsed.set(!this.collapsed());
  }

  onNavItemClick(): void {
    if (this.isSmallScreen()) {
      this.opened.set(false);
    }
  }

  logout(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cerrar Sesión',
        description: '¿Estás seguro que deseas cerrar sesión?',
      },
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.authService.logout();
    });
  }
}
