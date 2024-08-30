import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { UsuarioService } from '../../service/usuario.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfiluserselected',
  standalone: true,
  imports: [MatButtonModule, MatDividerModule, MatIconModule,MatFormFieldModule, MatInputModule],
  templateUrl: './perfiluserselected.component.html',
  styleUrl: './perfiluserselected.component.css'
})
export class PerfiluserselectedComponent implements OnInit{
  usuario: any = {
    usuarioID: undefined,
    nombres: "", // Usé 'nombres' en lugar de 'nombre' para coincidir con la respuesta del API
    paterno: "",
    materno: "",
    celular: "",
    domicilio: "",
    cargo: "",       // Campo agregado
    dependencia: "", // Campo agregado
    sigla: "",       // Campo agregado
    usuario: "",
    ci: "",
    status: false,
    createdAt: "",
    updatedAt: "",
    roles: []
  };
  nombreIntern: number = 0;
  constructor(private route: ActivatedRoute,private router: Router,private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.nombreIntern = params['number'];
    });
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    try {
      this.usuarioService.getUserProfile(this.nombreIntern).subscribe({
        next: (respuesta) => {
          console.log('Respuesta recibida:', respuesta); // Imprimir la respuesta recibida
          this.procesarDatosUsuario(respuesta.data); // Aquí pasamos respuesta.data
        },
        error: (error) => {
          console.error('Error al obtener los datos del usuario', error);
        }
      });
    } catch (error) {
      console.error(error);
      // Aquí podrías redirigir al usuario al login o mostrar un mensaje de error
    }
  }


  procesarDatosUsuario(datosUsuario: any) {
    console.log('Procesando datos del usuario:', datosUsuario); // Imprimir los datos antes de procesar
    this.usuario = {
      usuarioID: datosUsuario.usuarioID,
      nombres: datosUsuario.nombres, // Cambiado de 'nombre' a 'nombres' para coincidir con la respuesta de la API
      paterno: datosUsuario.paterno,
      materno: datosUsuario.materno,
      celular: datosUsuario.celular,
      domicilio: datosUsuario.domicilio,
      cargo: datosUsuario.cargo,         // Ahora incluye el campo 'cargo'
      dependencia: datosUsuario.dependencia, // Ahora incluye el campo 'dependencia'
      sigla: datosUsuario.sigla,         // Ahora incluye el campo 'sigla'
      usuario: datosUsuario.usuario,
      status: datosUsuario.status,
      ci: datosUsuario.ci,
      createdAt: datosUsuario.createdAt, // Puede ser null, manejarlo según la lógica de la aplicación
      updatedAt: datosUsuario.updatedAt, // Puede ser null, manejarlo según la lógica de la aplicación
      roles: datosUsuario.roles.map((rol: any) => rol.nombreRol) // Mapear para obtener solo los nombres de los roles
    };
  }

}
