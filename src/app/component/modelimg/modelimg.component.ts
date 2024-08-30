import { Component, Inject } from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DialogData } from '../home/home.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { FormatDatePipe } from "../../pipes/format-date.pipe";
import { TruncateDocumentNamePipe } from "../../pipes/truncate-document-name.pipe";

@Component({
    selector: 'app-modelimg',
    standalone: true,
    templateUrl: './modelimg.component.html',
    styleUrl: './modelimg.component.css',
    imports: [MatDialogTitle, MatDialogContent, MatButtonModule, MatDividerModule, MatIconModule, FormatDatePipe, TruncateDocumentNamePipe]
})
export class ModelimgComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
