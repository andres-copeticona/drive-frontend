import { Component, Inject, OnInit, input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ItemList } from '../../models/item.model';
import { FilesService } from '../../services/files.service';
import { FileModel } from '../../models/file.model';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-folder-preview',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    NgxExtendedPdfViewerModule,
  ],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.css',
})
export class PreviewComponent implements OnInit {
  inputItem = input<FileModel>();
  item = this.inputItem();

  get url() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.item?.link ?? '');
  }

  constructor(
    private fileService: FilesService,
    private ts: ToastrService,
    public sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data?: { item: ItemList },
  ) {}

  async ngOnInit() {
    if (this.item) return;
    if (!this.data?.item?.id) return;

    try {
      const res = await this.fileService.findOneBy(this.data.item.id);
      this.item = res.data;
    } catch (error) {
      console.error(error);
      this.ts.error('Ocurrió un error al cargar el archivo');
    }
  }

  download() {
    if (!this.item?.id) return;
    this.fileService.download(this.item);
  }
}