import { Component, EventEmitter, OnInit, Output, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@app/shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { ItemList } from '../../models/item.model';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { FilesService } from '../../services/files.service';
import { FolderService } from '../../services/folder.service';
import { ToastrService } from 'ngx-toastr';
import { PreviewComponent } from '../preview/preview.component';

@Component({
  selector: 'app-folder-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    MatRippleModule,
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.css',
})
export class ListItemComponent implements OnInit {
  item = input.required<ItemList>();
  @Output() onFolderClick = new EventEmitter<ItemList>();
  @Output() refresh = new EventEmitter<void>();

  roleId = this.authService.getInfo()?.roleId!;

  constructor(
    private authService: AuthService,
    private fileService: FilesService,
    private folderService: FolderService,
    private ts: ToastrService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {}

  download(): void {
    const service =
      this.item().type == 'folder' ? this.folderService : this.fileService;

    try {
      service.download({
        id: this.item().id,
        title: this.item().name,
      } as any);
    } catch (error) {
      console.error(error);
      this.ts.error('Ocurrio un error al intentar descargar', 'Error');
    }
  }

  share(): void {}

  async delete() {
    const type = this.item().type == 'folder' ? 'la carpeta' : 'el archivo';

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar',
        description: `Seguro de eliminar ${type}: '${this.item().name}'`,
      },
    });

    ref.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          let res: any = null;
          if (this.item().type == 'folder')
            res = await this.folderService.delete(this.item().id);
          else res = await this.fileService.delete(this.item().id);

          this.ts.success(res.message, 'success');
          console.log(res);
          this.refresh.emit();
        } catch (error) {
          console.error(error);
          this.ts.error('Ocurrio un error', 'Error');
        }
      }
    });
  }

  onItemClick(): void {
    if (this.item().type == 'folder') this.onFolderClick.emit(this.item());
    else {
      this.dialog.open(PreviewComponent, {
        data: { item: this.item() },
      });
    }
  }
}