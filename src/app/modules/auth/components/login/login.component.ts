import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '@shared/services/auth.service';
import { InactivityService } from '@app/shared/services/inactivity.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  mensajeBienvenido: string = 'Bienvenid@';
  displaylogin: string = 'flex';
  displaycharging: string = 'none';
  username: string = '';
  password: string = '';
  hide = true;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private inactivityService: InactivityService,
    private ts: ToastrService,
  ) {}

  ngOnInit(): void {}

  async onLogin(_event: any) {
    try {
      const res = await this.authService.login(this.username, this.password);
      const { data } = res;
      this.authService.saveInfo({
        userId: data.user.id,
        token: data.token,
        tokenExpiration: new Date(data.tokenExpiration),
        roleId: data.user.role.id,
      });
      this.inactivityService.start();
      this.router.navigate(['/cloud/home']);

      this.ts.success('Bienvenido', 'Inicio de sesión exitoso');
    } catch (error) {
      console.error(error);
      this.ts.error('Error al iniciar sesión', 'Error');
    }
  }
}
