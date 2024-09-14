import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatButtonModule } from '@angular/material/button';
import { FileModel } from '@app/modules/files/models/file.model';
import { FilesService } from '@app/modules/files/services/files.service';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpParams } from '@angular/common/http';
import {
  ACCESS_TYPES,
  FILE_CATEGORY,
  SORT_DIR,
} from '@app/shared/constants/constants';
import { ListItemComponent } from '@app/modules/files/components/item/item.component';
import { ItemList } from '@app/modules/files/models/item.model';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { QrService } from '@app/shared/services/qr.service';
import { QRCodeModule } from 'angularx-qrcode';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-sign-pdf',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,

    QRCodeModule,

    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTabsModule,
    MatExpansionModule,

    NgxExtendedPdfViewerModule,
    ListItemComponent,
  ],
  templateUrl: './sign-pdf.component.html',
  styleUrl: './sign-pdf.component.css',
})
export class SignPdfComponent implements OnInit {
  isLoading = false;
  isLoadingItem = false;

  selectedTab = 0;

  files: FileModel[] = [];
  filteredFiles: FileModel[] = [];

  itemSelected?: FileModel;

  search = '';
  categoryType = FILE_CATEGORY.NEW;

  formGroup: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });

  qrUrl?: string;

  constructor(
    private qrService: QrService,
    private fileService: FilesService,
    private ts: ToastrService,
    public sanitizer: DomSanitizer,
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    await this.loadFiles();
    this.isLoading = false;
  }

  async loadQrCode() {
    if (!this.itemSelected?.qrId) return;
    try {
      const res = await this.fileService.getQrCode(this.itemSelected.qrId);
      this.qrUrl = this.qrService.getSignQr(res.data);
    } catch (error: any) {
      const msg =
        error?.error?.message ?? 'Ocurrió un error al cargar el código QR';
      console.error(error);
      this.ts.error(msg, 'Error');
    }
  }

  async loadFiles() {
    try {
      const res = await this.fileService.findMany({
        params: new HttpParams({
          fromObject: {
            category: this.categoryType,
            accessType: ACCESS_TYPES.PUBLIC,
            sortDirection: SORT_DIR.DESC,
            type: 'application/pdf',
          },
        }),
      });
      this.files = res.data.data;
      if (this.search != '') this.onSearch();
      else this.filteredFiles = res.data.data;
    } catch (error: any) {
      const msg =
        error?.error?.message ?? 'Ocurrió un error al cargar los archivos';
      console.log(error);
      this.ts.error(msg, 'Error');
    }
  }

  download() {
    console.log(this.itemSelected);
    if (!this.itemSelected?.id) return;
    this.fileService.download(this.itemSelected);
  }

  toItem(item: FileModel): ItemList {
    let icon = 'picture_as_pdf';
    return {
      id: item.id.toString(),
      name: item.title,
      accessType: item.accessType,
      code: item.code,
      type: item.fileType,
      icon,
    };
  }

  async onSelectItem(file: FileModel) {
    this.itemSelected = file;
    this.selectedTab = 1;
    try {
      this.isLoadingItem = true;
      const res = await this.fileService.getPublicByCode(file.code);
      this.itemSelected = res.data;
      await this.loadQrCode();
    } catch (error: any) {
      const msg =
        error?.error?.message ?? 'Ocurrió un error al cargar el archivo';
      console.error(error);
      this.ts.error(msg, 'Error');
    } finally {
      this.isLoadingItem = false;
    }
  }

  onSearch() {
    this.filteredFiles = this.files.filter((file) =>
      file.title.toLowerCase().includes(this.search.toLowerCase()),
    );
  }

  onCategoryChange() {
    this.loadFiles();
  }

  copyText() {
    if (!this.qrUrl) return;
    navigator.clipboard
      .writeText(this.qrUrl)
      .then(() => {
        this.ts.success('Texto copiado al portapapeles', 'Texto copiado');
      })
      .catch((err) => {
        console.error(err);
        this.ts.error('Error al copiar texto al portapapeles', 'Error');
      });
  }

  async signDocument() {
    if (this.formGroup.invalid) return;

    const qrCode = uuidv4();
    const file = await this.addQrToPdf(this.qrService.getSignQr(qrCode));

    if (!file || !this.itemSelected) {
      this.ts.error('Error al firmar el documento', 'Error');
      return;
    }

    const data = new FormData();
    data.append('file', file);
    data.append('title', this.formGroup.value.title);
    data.append('description', this.formGroup.value.description);
    data.append('fileId', this.itemSelected.id.toString());
    data.append('qrCode', qrCode);

    try {
      const res = await this.fileService.signFile(data);
      this.itemSelected = res.data.file;
      this.qrUrl = this.qrService.getSignQr(res.data.qrCode);

      this.ts.success(res.message, 'Éxito');
      this.loadFiles();
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.error?.message ?? 'Ocurrió un error al firmar el archivo';
      this.ts.error(msg, 'Error');
    }
  }

  async addQrToPdf(qrUrl: string) {
    if (!this.itemSelected?.link) return;
    const pdfResponse = await fetch(this.itemSelected.link);
    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    const qrCodeDataUri = await QRCode.toDataURL(qrUrl);
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    const qrImage = await pdfDoc.embedPng(qrCodeDataUri.split(',')[1]);

    pdfDoc.getPages().forEach((page) => {
      page.drawImage(qrImage, {
        x: 10,
        y: page.getHeight() - 110,
        width: 80,
        height: 80,
      });
    });

    const modifiedPdfArrayBuffer = await pdfDoc.save();

    const blob = new Blob([modifiedPdfArrayBuffer], {
      type: 'application/pdf',
    });
    return new File([blob], 'Sellado_' + this.itemSelected?.title, {
      type: 'application/pdf',
    });
  }
}
