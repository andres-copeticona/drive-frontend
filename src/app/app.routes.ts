import { Routes } from '@angular/router';
import { authGuard } from './config/auth/auth.guard';
import { LoginComponent } from '@modules/auth/components/login/login.component';
import { UserDetailsComponent } from './modules/user/components/user-details/user-details.component';
import { UserListComponent } from './modules/user/components/user-list/user-list.component';
import { FolderComponent } from './modules/files/components/folders/folders.component';
import { LayoutComponent } from './layouts/layout/layout.component';
import { HomeComponent } from './modules/home/home.component';
import { SharedFilesComponent } from './modules/shared-files/shared-files.component';
import { ActivityCenterComponent } from './modules/activity/components/activitycenter/activitycenter.component';
import { ShareFolderComponent } from './modules/shared-folders/share-folder.component';
import { DetailsQRComponent } from './modules/details-qr/details-qr.component';
import { PublicFileComponent } from './modules/public/file/public-file.component';
import { PublicFolderComponent } from './modules/public/folder/public-folder.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'publico',
    children: [
      { path: 'detalles/:code', component: DetailsQRComponent },
      { path: 'archivos/:code/ver', component: PublicFileComponent },
      { path: 'carpetas/:code', component: PublicFolderComponent },
    ],
  },
  {
    path: 'nube',
    component: LayoutComponent,
    canActivateChild: [authGuard],
    canMatch: [authGuard],
    children: [
      { path: 'inicio', component: HomeComponent },
      { path: 'archivoscompartidos', component: SharedFilesComponent },
      { path: 'carpetas', component: FolderComponent },
      { path: 'perfil', component: UserDetailsComponent },
      { path: 'listausuarios', component: UserListComponent },
      { path: 'carpetascompartidas', component: ShareFolderComponent },
      { path: 'actividad', component: ActivityCenterComponent },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
