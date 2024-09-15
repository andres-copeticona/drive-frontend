import { Routes } from '@angular/router';
import { NavigationComponent } from './component/navigation/navigation.component';
import { FavoritesComponent } from './component/favorites/favorites.component';
import { ProfileComponent } from './component/profile/profile.component';
import { FileViewComponent } from './component/file-view/file-view.component';
import { DetalleselloComponent } from './component/detallesello/detallesello.component';
import { ShareFilesComponent } from './component/share-files/share-files.component';
import { ModelpdfviewComponent } from './component/modelpdfview/modelpdfview.component';
import { PresentationComponent } from './component/presentation/presentation.component';
import { PresentationfolderComponent } from './component/presentationfolder/presentationfolder.component';
import { ActivitycenterComponent } from './component/activitycenter/activitycenter.component';
import { authGuard } from './config/auth/auth.guard';
import { LoginComponent } from '@modules/auth/components/login/login.component';
import { UserDetailsComponent } from './modules/user/components/user-details/user-details.component';
import { UserListComponent } from './modules/user/components/user-list/user-list.component';
import { FolderComponent } from './modules/files/components/folders/folders.component';
import { LayoutComponent } from './layouts/layout/layout.component';
import { HomeComponent } from './modules/home/home.component';
import { SharedFilesComponent } from './modules/shared-files/shared-files.component';

export const routes: Routes = [
  //Login
  { path: '', component: LoginComponent },
  {
    path: 'detalleSello',
    component: DetalleselloComponent,
    canMatch: [authGuard],
  },
  { path: 'file', component: PresentationComponent, canMatch: [authGuard] },
  {
    path: 'folder',
    component: PresentationfolderComponent,
    canMatch: [authGuard],
  },
  //Para el user Admin
  {
    path: 'adminc',
    component: NavigationComponent,
    canActivateChild: [authGuard],
    canMatch: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'sharedFiles', component: SharedFilesComponent },
      // { path: 'upload', component: UploadsComponent },
      { path: 'favorites', component: FavoritesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'signedfiles', component: FileViewComponent },
      { path: 'detalleSello', component: DetalleselloComponent },
      { path: 'file', component: PresentationComponent },
    ],
  },
  //Para el user cloud
  {
    path: 'cloud',
    component: LayoutComponent,
    canActivateChild: [authGuard],
    canMatch: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'sharedFiles', component: SharedFilesComponent },
      // { path: 'upload', component: UploadsComponent },
      // { path: 'reemplazar', component: UploadreemplazarComponent },
      { path: 'folders', component: FolderComponent },
      { path: 'profile', component: UserDetailsComponent },
      { path: 'userlist', component: UserListComponent },
      { path: 'signedfiles', component: FileViewComponent },
      { path: 'sharedfolders', component: ShareFilesComponent },
      { path: 'pdfview', component: ModelpdfviewComponent },
      { path: 'activity', component: ActivitycenterComponent },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
