import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UsuarioService } from '../../service/usuario.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { QrService } from '@app/shared/services/qr.service';
import { QrCodeData } from './models/qr-code-data';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-detallesello',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,

    NgxExtendedPdfViewerModule,
  ],
  templateUrl: './details-qr.component.html',
  styleUrl: './details-qr.component.css',
})
export class DetailsQRComponent implements OnInit {
  qr?: QrCodeData;

  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qrservice: QrService,
    public usuarioService: UsuarioService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId))
      this.route.params.subscribe((params) => {
        if (params['code']) {
          this.loadQrData(params['code']);
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  async loadQrData(code: string) {
    try {
      const res = await this.qrservice.getQrData(code);
      this.qr = res.data;
    } catch (error: any) {
      console.error(error);
      this.errorMessage = 'Qr Inválido';
    }
  }
}
