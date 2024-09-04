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

  async onLogin(event: any) {
    console.log(event);
    try {
      const res = await this.authService.login(this.username, this.password);
      this.authService.saveInfo({
        userId: res.user.id,
        token: res.token,
        roleId: res.user.roles[0].rolID,
      });
      this.inactivityService.start();

      //TODO: Handle different roles
      if (res.user.roles[0].rolID === 3) {
        this.router.navigate(['/cloud/userlist']);
      } else {
        this.router.navigate(['/cloud/home']);
      }

      this.ts.success('Bienvenido', 'Inicio de sesión exitoso');
    } catch (error) {
      console.error(error);
      this.ts.error('Error al iniciar sesión', 'Error');
    }
  }
}
