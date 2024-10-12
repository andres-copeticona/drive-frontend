import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatButtonModule } from '@angular/material/button';
import { FileModel } from '@app/modules/files/models/file.model';
import { FilesService } from '@app/modules/files/services/files.service';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-public-file',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    NgxExtendedPdfViewerModule,
  ],
  templateUrl: './public-file.component.html',
  styleUrl: './public-file.component.css',
})
export class PublicFileComponent implements OnInit {
  file?: FileModel;

  get url() {
    return this.file?.minioLink ?? '';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FilesService,
    private ts: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId))
      this.route.params.subscribe((params) => {
        if (params['code']) {
          this.loadFile(params['code']);
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  async loadFile(code: string) {
    try {
      const res = await this.fileService.getPublicByCode(code);
      this.file = res.data;
    } catch (error) {
      console.error(error);
      this.ts.error('Ocurrió un error al cargar el archivo');
      this.router.navigate(['/']);
    }
  }

  download() {
    if (!this.file?.code) return;
    this.fileService.publicDownload(this.file);
  }
}
