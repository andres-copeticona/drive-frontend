import { Component, OnInit, Signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { NavigationComponent } from './component/navigation/navigation.component';
import { HttpClientModule } from '@angular/common/http';
import { InactivityService } from './shared/services/inactivity.service';
import { AuthService } from './shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';

export type MenuItem = {
  icon: string;
  label: string;
  route: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    NavigationComponent,
    HttpClientModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'drive-frontend';
  menuItem1: MenuItem = { icon: 'home', label: 'Home', route: '/' };
  menuItems: Signal<MenuItem[]> = signal([
    { icon: 'home', label: 'Home', route: '/' },
    { icon: 'folder', label: 'Files', route: '/files' },
    { icon: 'settings', label: 'Settings', route: '/settings' },
  ]);

  constructor(
    private inactivityService: InactivityService,
    private authService: AuthService,
    private ts: ToastrService,
  ) {}

  ngOnInit(): void {
    this.inactivityService.onUserInactive.subscribe(() => {
      this.authService.logout();
      console.log('User is inactive');
      this.ts.warning('Sesión cerrada por inactividad', 'Sesión cerrada');
    });
  }
}
