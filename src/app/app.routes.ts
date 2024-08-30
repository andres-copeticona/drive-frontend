import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { NavigationComponent } from './component/navigation/navigation.component';
import { FileSharingComponent } from './component/file-sharing/file-sharing.component';
import { UploadsComponent } from './component/uploads/uploads.component';
import { LoginComponent } from './component/login/login.component';
import { FavoritesComponent } from './component/favorites/favorites.component';
import { ProfileComponent } from './component/profile/profile.component';
import { UserlistComponent } from './component/userlist/userlist.component';
import { NavigationAdminComponent } from './component/navigation-admin/navigation-admin.component';
import { FileViewComponent } from './component/file-view/file-view.component';
import { PerfiluserselectedComponent } from './component/perfiluserselected/perfiluserselected.component';
import { DetalleselloComponent } from './component/detallesello/detallesello.component';
import { ShareFilesComponent } from './component/share-files/share-files.component';
import { ModelpdfviewComponent } from './component/modelpdfview/modelpdfview.component';
import { PresentationComponent } from './component/presentation/presentation.component';
import { PresentationfolderComponent } from './component/presentationfolder/presentationfolder.component';
import { ActivitycenterComponent } from './component/activitycenter/activitycenter.component';
import { UploadreemplazarComponent } from './component/uploadreemplazar/uploadreemplazar.component';

export const routes: Routes = [
    //Login
    { path: '', component: LoginComponent},
    { path: 'detalleSello', component: DetalleselloComponent},
    { path: 'file', component: PresentationComponent},
    { path: 'folder', component: PresentationfolderComponent},
    //Para el user Admin
    { path: 'admin', component: NavigationComponent,
        children:[
            { path: 'home', component: HomeComponent },
            { path: 'sharedFiles', component: FileSharingComponent },
            { path: 'upload', component: UploadsComponent},
            { path: 'favorites', component: FavoritesComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'signedfiles', component: FileViewComponent },
            { path: 'detalleSello', component: DetalleselloComponent},
            { path: 'file', component: PresentationComponent},
        ]
    },
    //Para el user cloud
    { path: 'cloud', component: NavigationAdminComponent,
        children:[
            { path: 'home', component: HomeComponent },
            { path: 'sharedFiles', component: FileSharingComponent },
            { path: 'upload', component: UploadsComponent},
            { path: 'reemplazar', component: UploadreemplazarComponent},
            { path: 'favorites', component: FavoritesComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'userlist', component: UserlistComponent },
            { path: 'signedfiles', component: FileViewComponent },
            { path: 'perfiluserselected', component: PerfiluserselectedComponent},
            { path: 'sharedfolders', component: ShareFilesComponent},
            { path: 'pdfview', component: ModelpdfviewComponent},
            { path: 'activity', component: ActivitycenterComponent},
        ]
    },
];
