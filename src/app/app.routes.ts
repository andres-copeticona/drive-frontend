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
    path: 'public',
    children: [
      { path: 'details/:code', component: DetailsQRComponent },
      { path: 'file/:code/view', component: PublicFileComponent },
      { path: 'folder/:code', component: PublicFolderComponent },
    ],
  },
  {
    path: 'cloud',
    component: LayoutComponent,
    canActivateChild: [authGuard],
    canMatch: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'sharedFiles', component: SharedFilesComponent },
      { path: 'folders', component: FolderComponent },
      { path: 'profile', component: UserDetailsComponent },
      { path: 'userlist', component: UserListComponent },
      { path: 'sharedfolders', component: ShareFolderComponent },
      { path: 'activity', component: ActivityCenterComponent },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
