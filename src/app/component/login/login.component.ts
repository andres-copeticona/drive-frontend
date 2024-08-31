import { Component, OnInit, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
import { AuthServiceService } from '../../service/auth-service.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
    private authService: AuthServiceService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  handleInactivity(): void {
    if (this.authService.verificarExpiracionToken()) {
      this.authService.cerrarSesion();
      this.router.navigate(['/login']);
      alert(
        'Tu sesión ha expirado por inactividad, por favor vuelve a iniciar sesión.',
      );
    }
  }

  onLogin(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response && response.user) {
          this.authService.guardarDatosUsuario(response.user);
          this.authService.guardarToken(response.token);

          if (response.status === 500) {
            this.mostrarMensajeDeleteError();
          } else {
            this.displaycharging = 'flex';
            this.displaylogin = 'none';
            setTimeout(() => {
              if (response.user.roles[0].rolID === 3) {
                this.router.navigate(['/cloud/userlist']);
              } else {
                this.router.navigate(['/cloud/home']);
              }
            }, 2000);
          }
        } else {
          this.errorMessage = 'Respuesta inválida del servidor.';
          this.mostrarMensajeDeleteError();
        }
      },
      error: (error) => {
        console.error('Error de autenticación:', error);
        this.errorMessage = 'Usuario o Contraseña incorrecta';
        this.mostrarMensajeDeleteError();
      },
    });
  }

  mostrarAlertaDelete = false;
  mostrarAlertaErrorDelete = false;

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
    this.mostrarAlertaDelete = false;
    this.mostrarAlertaErrorDelete = false;
  }
}
