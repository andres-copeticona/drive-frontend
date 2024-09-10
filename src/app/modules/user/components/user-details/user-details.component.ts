import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { AuthService } from '@app/shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/shared/models/user.model';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
})
export class UserDetailsComponent implements OnInit {
  data?: User;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private ts: ToastrService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.load(params['number']);
    });
  }

  async load(paramId?: string | number) {
    let id = paramId;

    if (!id) id = this.authService.getInfo()?.userId ?? undefined;

    if (!id) return this.authService.logout();

    try {
      const res = await this.userService.findOneBy(id);
      this.data = res?.data;
    } catch (error) {
      console.error(error);
      this.ts.error('Error al obtener los datos del usuario');
    }
  }
}
