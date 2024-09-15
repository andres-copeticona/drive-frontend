import {
  AfterContentInit,
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  afterNextRender,
} from '@angular/core';
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
import { FormatDatePipe } from '@app/pipes/format-date.pipe';
import { Activity } from '../../models/activity.model';
import { ActivityService } from '../../services/activity.service';
import { PaginatorIntl } from '@app/shared/components/paginator-intl/paginator-intl.component';

export interface UserData {
  id: number;
  nombre: string;
  fecha: string;
  ip: string;
  usuarioId: string;
  tipoActividad: string;
}
@Component({
  selector: 'app-activitycenter',
  standalone: true,
  imports: [
    DatePipe,
    FormatDatePipe,
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
  userColumns: string[] = ['userId', 'fullname', 'date', 'ip', 'activityType'];
  @ViewChild(MatPaginator) userPaginator!: MatPaginator;

  sharedSearchControl = new FormControl('');
  sharedDataSource = new MatTableDataSource<Activity>();
  sharedActivityColumns: string[] = [
    'name',
    'type',
    'fileId',
    'fodlerId',
    'quantity',
  ];
  @ViewChild(MatPaginator) sharedPaginator!: MatPaginator;
  sharedFilter = {
    searchTerm: '',
    page: 0,
    size: 5,
  };

  onSharedPage(event: PageEvent) {
    this.sharedFilter.page = event.pageIndex;
    this.sharedFilter.size = event.pageSize;
    // this.loadShared
  }

  constructor(
    public activityService: ActivityService,
    // public actividadeService: ActividadService,
    // public actividadesCompartidasService: ActividadcompartidoService,
  ) {
    this.userSearchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        const res = this.userList.filter((user) => {
          return (
            user.user.fullName.includes(value!) ||
            user.activityType.includes(value!)
          );
        });

        this.userDataSource.data = res;

        if (this.userDataSource.paginator)
          this.userDataSource.paginator.firstPage();
      });

    this.sharedSearchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.sharedFilter.searchTerm = value!;
        // this.loadShared();
        if (this.userPaginator) this.userPaginator.firstPage();
      });
  }

  async ngAfterViewInit() {
    this.userDataSource.paginator = this.userPaginator;
  }

  async ngOnInit() {
    await this.loadUsersActivities();
    // await this.loadShared();
  }

  async loadUsersActivities() {
    const res = await this.activityService.findMany();
    this.userList = res.data.data;
    this.userDataSource.data = this.userList;
  }

  // async loadShared() {
  //   const res = await this.activityService.findMany({
  //     params: new HttpParams({
  //       fromObject: {
  //         searchTerm: this.sharedDataSource.filter,
  //         page: this.sharedDataSource.paginator?.pageIndex!,
  //         size: this.sharedDataSource.paginator?.pageSize!,
  //       },
  //     }),
  //   });
  //   this.sharedDataSource.data = res.data.data;
  // }
}
