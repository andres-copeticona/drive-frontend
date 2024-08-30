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
import { QrServiceService } from '../../service/qr-service.service';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../service/actividad.service';
@Component({
  selector: 'app-detallesello',
  standalone: true,
  imports: [MatButtonModule, MatDividerModule, MatIconModule,MatFormFieldModule, MatInputModule, CommonModule],
  templateUrl: './detallesello.component.html',
  styleUrl: './detallesello.component.css'
})
export class DetalleselloComponent implements OnInit {
  userList$!: Observable<any[]>;
  qr: any = {
    id: 0,
    emisor: "",
    mensaje: "",
    titulo: "",
    fechaCreacion: new Date(),
    codeQr: ''
  }

  nombreEmisor: string = '';
  dependenciaEmisor: string = '';


  signedidentifier: number = 0;
  constructor(
    private route: ActivatedRoute,private router: Router,private qrservice: QrServiceService, public usuarioService: UsuarioService) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.signedidentifier = params['signed'];
    });
    this.cargarDatosSello();
  }

  // Método para cargar la lista de usuarios
  cargarlistausers(){
    this.usuarioService.getAllUsers().subscribe(
      response => {
        this.userList$ = of(response.data.content);
        for(let i = 0; i < response.data.content.length; i++){
          if(response.data.content[i].usuarioID == this.qr.emisor){
            this.nombreEmisor = response.data.content[i].nombres+ ' ' + response.data.content[i].paterno + ' ' + response.data.content[i].materno;
            this.dependenciaEmisor = response.data.content[i].dependencia;
          }
        }
        // Manejar la respuesta de éxito aquí
        console.log('Registros de usuarios', response.data.content[1].nombres);
      },
      error => {
        // Manejar el error aquí
        console.error('Error al mostrar usuarios', error);
      }
    )
  }

  // Método para cargar los datos del sello
  cargarDatosSello() {
    this.qrservice.getQrCodeById(this.signedidentifier).subscribe({
      next: (respuesta) => {
        console.log('Respuesta recibida:', respuesta); // Imprimir la respuesta recibida
        this.qr = respuesta.data;
        if (this.qr.emisor && this.qr.mensaje && this.qr.fechaCreacion && this.qr.codeQr) {
          // Todos los campos están presentes
          this.cargarlistausers();
        } else {
          console.error('Error: Falta uno o más campos requeridos en el objeto QR.');
        }
      },
      error: (error) => {
        console.error('Error al obtener los datos del sello', error);
      }
    });
  }


}
