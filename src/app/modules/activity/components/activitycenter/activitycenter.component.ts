import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DatePipe } from '@angular/common';
import { Activity } from '../../models/activity.model';
import { ActivityService } from '../../services/activity.service';
import { PaginatorIntl } from '@app/shared/components/paginator-intl/paginator-intl.component';
import { HttpParams } from '@angular/common/http';
import { ACCESS_TYPES, SORT_DIR } from '@app/shared/constants/constants';
import { MatTabsModule } from '@angular/material/tabs';
import { FolderService } from '@app/modules/files/services/folder.service';
import { Folder } from '@app/modules/files/models/folder.model';
import { FilesService } from '@app/modules/files/services/files.service';
import { FileModel } from '@app/modules/files/models/file.model';
import { QrService } from '@app/shared/services/qr.service';
import { QrCodeData } from '@app/modules/details-qr/models/qr-code-data';
import { formatDate } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

Chart.register(...registerables);

@Component({
  selector: 'app-activitycenter',
  host: { ngSkipHydratation: 'true' },
  standalone: true,
  imports: [
    DatePipe,
    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatTabsModule,
    MatPaginatorModule,
  ],
  templateUrl: './activitycenter.component.html',
  styleUrl: './activitycenter.component.css',
  providers: [{ provide: MatPaginatorIntl, useClass: PaginatorIntl }],
})
export class ActivityCenterComponent implements OnInit, AfterViewInit {
  userList: Activity[] = [];
  userSearchControl = new FormControl('');
  userDataSource = new MatTableDataSource<Activity>();
  userColumns: string[] = [
    'userId',
    'fullname',
    'date',
    'ip',
    'activityType',
    'description',
  ];
  @ViewChild('userPaginator') userPaginator!: MatPaginator;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart<ChartType, number[], string>;
  columnFilters: { [key: string]: string } = {};
  userTotals = 0;
  userFilter = {
    searchTerm: '',
    page: 0,
    size: 5,
    sortDirection: SORT_DIR.DESC,
  };

  async onUserPage(event: PageEvent) {
    this.userFilter.page = event.pageIndex;
    this.userFilter.size = event.pageSize;
    await this.loadUsersActivities();
  }

  sharedSearchControl = new FormControl('');
  sharedDataSource = new MatTableDataSource<Folder>();
  sharedActivityColumns: string[] = ['id', 'name', 'code', 'quantity'];
  @ViewChild('sharedPaginator') sharedPaginator!: MatPaginator;
  sharedFilter = {
    searchTerm: '',
    page: 0,
    size: 5,
    accessType: ACCESS_TYPES.PUBLIC,
    sortDirection: SORT_DIR.DESC,
  };

  onSharedPage(event: PageEvent) {
    this.sharedFilter.page = event.pageIndex;
    this.sharedFilter.size = event.pageSize;
    this.loadShared();
  }

  constructor(
    public activityService: ActivityService,
    public folderService: FolderService,
    public fileService: FilesService,
    public qrService: QrService,
  ) {
    this.userSearchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.applyGlobalFilter(value!);
      });

    this.sharedSearchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.sharedFilter.searchTerm = value!;
        this.sharedPaginator.firstPage();
        this.loadShared();
      });

    this.fileSearchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.fileFilter.searchTerm = value!;
        this.filePaginator.firstPage();
        this.loadFiles();
      });

    this.qrSearchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.qrFilter.searchTerm = value!;
        this.qrPaginator.firstPage();
        this.loadqrs();
      });
  }

  async ngAfterViewInit() {
    await this.loadUsersActivities();
    await this.loadShared();
    await this.loadFiles();
    await this.loadqrs();
    await this.createChart();
  }

  async ngOnInit() : Promise<void> {
    this.userDataSource.paginator = this.userPaginator;

    this.userDataSource.filterPredicate = (data: Activity, filter: string) => {
      const filterObj = JSON.parse(filter);
  
      return Object.keys(filterObj).every(column => {
        const filterValue = filterObj[column].trim().toLowerCase();
  
        let dataValue: string;
  
        switch (column) {
          case 'userId':
            dataValue = String(data.user?.id || '').trim().toLowerCase();
            break;
          case 'fullname':
            dataValue = String(data.user?.fullName || '').trim().toLowerCase();
            break;
          case 'date':
            dataValue = new Date(data.date).toLocaleDateString().toLowerCase();
            break;
          case 'ip':
            dataValue = String(data.ip || '').trim().toLowerCase();
            break;
          case 'activityType':
            dataValue = String(data.activityType || '').trim().toLowerCase();
            break;
          case 'description':
            dataValue = String(data.description || '').trim().toLowerCase();
            break;
          default:
            return true; // Skip unknown columns
        }
  
        return dataValue.includes(filterValue);
      });
    };
  }

  async printActivityPDF(){
    let doc = new jsPDF();
    doc.text("Reporte de Actividades",20,10);
    autoTable(doc, {html: "#activityTable"});
    const chartImage = await this.getChartImage();
    if (chartImage) {
      // Ensure the image format is correct
      if (chartImage.startsWith("data:image/png")) {
        doc.addPage();
        doc.addImage(chartImage, 'PNG', 15, 40, 180, 160);
      } else {
        console.error("Invalid image format.");
      }
    } else {
      console.error("Chart image not available.");
    }
    doc.save("ReporteActividades"+formatDate(new Date(),'dd-MM-yyyy-hh:mm:ss','en')+".pdf");
  }

  async createChart(){
    while (!this.chartCanvas?.nativeElement) {
      console.error("Chart canvas element is not available.");
      await new Promise(f => setTimeout(f, 1000));
    }
    const activityCounts: { [key: string]: number } = {};

    this.userDataSource.filteredData.forEach((activity) => {
      const type = activity.activityType || 'Unknown';
      activityCounts[type] = (activityCounts[type] || 0) + 1;
    });

    const labels = Object.keys(activityCounts);
    const data = Object.values(activityCounts);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chartCanvas.nativeElement.width = 200;
    this.chartCanvas.nativeElement.height = 200;

    const chartConfig: ChartConfiguration<ChartType, number[], string> = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], // Sample colors
        }],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Operaciones Realizadas',
            position: 'top',
            padding: {
              top: 10,
              bottom: 30
            },
            font: {
              size: 50, // Adjust font size for legend labels
            },
          },
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 30, // Adjust font size for legend labels
              },
            },
          },
        },
      },
    };

    if (this.chartCanvas?.nativeElement) {
      this.chart = new Chart(this.chartCanvas.nativeElement, chartConfig);
    } else {
      console.error('Chart canvas element is not available.');
    }
  }

  async getChartImage(): Promise<string | null> {
    return new Promise((resolve) => {
      if (this.chart) {
        setTimeout(() => {
          try {
            const chartCanvas = this.chartCanvas.nativeElement;
            const chartImage = chartCanvas.toDataURL('image/png');
            resolve(chartImage);
          } catch (error) {
            console.error("Error generating chart image:", error);
            resolve(null);
          }
        }, 1000);
      } else {
        resolve(null);
      }
    });
  }

  async printSharedPDF(){
    let doc = new jsPDF();
    doc.text("Reporte de Carpetas Compartidas",20,10);
    autoTable(doc, {html: "#sharedTable"});
    doc.save("Reporte_de_Carpetas_Compartidas_"+formatDate(new Date(),'dd-MM-yyyy-hh:mm:ss','en')+".pdf");
  }

  async printFilesPDF(){
    let doc = new jsPDF();
    doc.text("Reporte de Archivos Compartidos",20,10);
    autoTable(doc, {html: "#filesTable"});
    doc.save("Reporte_de_Archivos_Compartidos"+formatDate(new Date(),'dd-MM-yyyy-hh:mm:ss','en')+".pdf");
  }

  async printQRPDF(){
    let doc = new jsPDF();
    doc.text("Reporte de Firmas QR",20,10);
    autoTable(doc, {html: "#qrTable"});
    doc.save("Reporte_de_QR_"+formatDate(new Date(),'dd-MM-yyyy-hh:mm:ss','en')+".pdf");
  }


  async loadUsersActivities() {
    const res = await this.activityService.findMany({
      params: new HttpParams({ fromObject: this.userFilter }),
    });
    this.userDataSource.data = res.data.data;
    this.userPaginator.length = res.data.total;
  }

  applyGlobalFilter(value: string) {
    this.userDataSource.filter = JSON.stringify({ global: value });
  }

  applyColumnFilter(column: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.columnFilters[column] = value;
    this.userDataSource.filter = JSON.stringify(this.columnFilters);
  }

  async loadShared() {
    const res = await this.folderService.findMany({
      params: new HttpParams({
        fromObject: this.sharedFilter,
      }),
    });
    this.sharedDataSource.data = res.data.data;
    this.sharedPaginator.length = res.data.total;
  }

  fileSearchControl = new FormControl('');
  fileDataSource = new MatTableDataSource<FileModel>();
  fileActivityColumns: string[] = ['id', 'name', 'code', 'quantity'];
  @ViewChild('filePaginator') filePaginator!: MatPaginator;
  fileFilter = {
    searchTerm: '',
    page: 0,
    size: 5,
    accessType: ACCESS_TYPES.PUBLIC,
    sortDirection: SORT_DIR.DESC,
    category: 'Nuevo',
  };

  onFilePage(event: PageEvent) {
    this.fileFilter.page = event.pageIndex;
    this.fileFilter.size = event.pageSize;
    this.loadFiles();
  }

  async loadFiles() {
    const res = await this.fileService.findMany({
      params: new HttpParams({
        fromObject: this.fileFilter,
      }),
    });
    this.fileDataSource.data = res.data.data;
    this.filePaginator.length = res.data.total;
  }

  qrSearchControl = new FormControl('');
  qrDataSource = new MatTableDataSource<QrCodeData>();
  qrActivityColumns: string[] = ['id', 'name', 'title', 'code', 'quantity'];
  @ViewChild('qrPaginator') qrPaginator!: MatPaginator;
  qrFilter = {
    searchTerm: '',
    page: 0,
    size: 5,
    sortDirection: SORT_DIR.DESC,
  };

  onQrPage(event: PageEvent) {
    this.qrFilter.page = event.pageIndex;
    this.qrFilter.size = event.pageSize;
    this.loadqrs();
  }

  async loadqrs() {
    const res = await this.qrService.findMany({
      params: new HttpParams({
        fromObject: this.qrFilter,
      }),
    });
    this.qrDataSource.data = res.data.data;
    this.qrPaginator.length = res.data.total;
  }
}
