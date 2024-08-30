import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http'
import { enviroment } from '../../environments/enviroment';
import { AuthServiceService } from './auth-service.service';
import { ResponseDto } from '../model/response';
import { FolderDto } from '../model/folder';
import { FolderContentsDto } from '../model/folderContend';
import { UsuarioDTO } from '../model/usuario';

@Injectable({
  providedIn: 'root'
})
export class FolderService {

  private API_SERVER = `${enviroment.API_URL}/folder`;
  private API_SERVER_SHARE = `${enviroment.API_URL}/api/v1/auth`;

  constructor(
    private httpClient: HttpClient,
    private authService: AuthServiceService
  ) { }

  public getAllFolders(): Observable<ResponseDto<FolderDto[]>> {
    const userId = this.authService.obtenerIdUsuario();
    if (!userId) {
      // Manejo de error o lógica alternativa si no hay userId disponible
      throw new Error('User ID not available. User might not be logged in.');
    }

    // Llama a la API pasando el userId para obtener los folders específicos del usuario
    return this.httpClient.get<ResponseDto<FolderDto[]>>(`${this.API_SERVER}/list/${userId}`);
  }

  getSharedFiles(userId: number, folderid: number): Observable<any> {
    const url = `${this.API_SERVER}/shared/${userId}/${folderid}`;
    return this.httpClient.get<any>(url);
  }

  public registerNewFolder1(folderName: string, userId: number, parentFolderId?: string): Observable<any> {
    let params = new HttpParams()
      .set('folderName', folderName)
      .set('userId', userId.toString());

    if (parentFolderId !== undefined) {
      params = params.set('parentFolderId', parentFolderId.toString());
    }
    return this.httpClient.post(this.API_SERVER + "/create", {}, { params: params });
}

  // folder compartidos

  shareFolder(folderId: number, emisorId: number, receptorId: number): Observable<any> {
    const body = { folderId, emisorId, receptorId };
    return this.httpClient.post(`${this.API_SERVER}/share`, body);
  }

  listSharedFolders(userId: number): Observable<ResponseDto<FolderDto[]>> {
    return this.httpClient.get<ResponseDto<FolderDto[]>>(`${this.API_SERVER}/shared/${userId}`);
  }

  listSharedFolderContents(userId: number, folderId: number): Observable<ResponseDto<FolderContentsDto>> {
    return this.httpClient.get<ResponseDto<FolderContentsDto>>(`${this.API_SERVER}/shared/${userId}/${folderId}`);
  }

  // Método para listar los usuarios con acceso a una carpeta
  public listUsersWithAccessToFolder(folderId: number): Observable<ResponseDto<UsuarioDTO[]>> {
    return this.httpClient.get<ResponseDto<UsuarioDTO[]>>(`${this.API_SERVER}/shared/users/${folderId}`);
  }


  // Metodos para compartir folders a nivel global


  // Método para obtener todas las dependencias
  public getAllDependencies(): Observable<ResponseDto<string[]>> {
    return this.httpClient.get<ResponseDto<string[]>>(`${this.API_SERVER_SHARE}/dependencies`);
  }

  // Método para compartir una carpeta con todos los usuarios
  public shareFolderWithAllUsers(folderId: number): Observable<ResponseDto<string>> {
    // Aquí necesitas obtener el ID del usuario actual
    const userId = this.authService.obtenerIdUsuario();
    const body = { folderId, emisorId: userId };
    return this.httpClient.post<ResponseDto<string>>(`${this.API_SERVER}/share/all`, body);
  }

  // Método para compartir una carpeta con usuarios de una dependencia
  public shareFolderWithUsersByDependency(dependencyName: string, folderId: number): Observable<ResponseDto<string>> {
    // Aquí necesitas obtener el ID del usuario actual
    const userId = this.authService.obtenerIdUsuario();
    const body = { folderId, emisorId: userId };
    return this.httpClient.post<ResponseDto<string>>(`${this.API_SERVER}/share/dependency/${dependencyName}`, body);
  }

  public getfoldersbydependency(dependencyName: string): Observable<ResponseDto<string[]>> {
    // Aquí necesitas obtener el ID del usuario actual
    return this.httpClient.get<ResponseDto<string[]>>(`${this.API_SERVER}/shared/dependency/${dependencyName}`);
  }

  public getfoldersbyuser(userId: number): Observable<ResponseDto<string[]>> {
    // Aquí necesitas obtener el ID del usuario actual
    return this.httpClient.get<ResponseDto<string[]>>(`${this.API_SERVER}/shared/user/${userId}`);
  }

  public detelefolder(folderName: string): Observable<any> {
    return this.httpClient.delete(`${this.API_SERVER}/delete/${folderName}`);
  }

  public downloadFile(foldername: string) {
    return this.httpClient.get(`${this.API_SERVER}/download/${foldername}`, { responseType: 'blob' });
  }

}
