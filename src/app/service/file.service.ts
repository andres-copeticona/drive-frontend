import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { enviroment } from '../../environments/enviroment';
import { AuthServiceService } from './auth-service.service';
import { ResponseDto } from '../model/response';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private API_SERVER = `${enviroment.API_URL}/file`;

  constructor(
    private httpClient: HttpClient,
    private authService: AuthServiceService
  ) {}

  public getAllFiles(): Observable<any>{
    return this.httpClient.get(this.API_SERVER);
  }

  public registerNewFile(registroArchivo: any): Observable<any>{
    return this.httpClient.post(this.API_SERVER, registroArchivo)
  }

  // Nuevo método para cargar archivos
  public uploadFile(bucket: string, file: File, data: any): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify(data)); // Asegúrate de que los nombres de los campos coincidan con los esperados por el backend

    // Definir la ruta completa incluyendo el bucket
    const uploadURL = `${this.API_SERVER}/upload/${bucket}`;
    return this.httpClient.post(uploadURL, formData);
  }

  public listFilesByUserAndFolder(folderId: number): Observable<any> {
    const userId = this.authService.obtenerIdUsuario(); // Usa el método del AuthService para obtener el userId
    if (!userId) {
      throw new Error('User ID not available'); // O maneja esta situación de manera adecuada para tu app
    }

    const listURL = `${this.API_SERVER}/list/${userId}/${folderId}`;
    return this.httpClient.get(listURL);
  }

  public listFilesByUserAndFolderWhitoutID(folderId: number, userExternoID: number): Observable<any> {

    const listURL = `${this.API_SERVER}/list/${userExternoID}/${folderId}`;
    return this.httpClient.get(listURL);
  }

  public listFilesByFolder(folderId: number, userId: number): Observable<any> {
    //const userId = this.authService.obtenerIdUsuario(); // Usa el método del AuthService para obtener el userId

    const listURL = `${this.API_SERVER}/list/${userId}/${folderId}`;
    return this.httpClient.get(listURL);
  }

  public listFilesByUserAndFolderWithId(userId: number,folderId: number): Observable<any> {

    const listURL = `${this.API_SERVER}/list/${userId}/${folderId}`;
    return this.httpClient.get(listURL);
  }

  public listFilesByUCategory(category: string): Observable<any> {
    const userId = this.authService.obtenerIdUsuario();
    if (!userId) {
      throw new Error('User ID not available');
    }

    const listURL = `${this.API_SERVER}/files-by-category?categoria=${category}&userId=${userId}`;
    return this.httpClient.get(listURL);
  }

  public getRecentFiles(): Observable<any> {
    const userId = this.authService.obtenerIdUsuario();
    if (!userId) {
      throw new Error('User ID not available');
    }

    const listURL = `${this.API_SERVER}/recent/${userId}`;
    return this.httpClient.get(listURL);
  }

  // modificacion de categoria
  public updateFileCategory(fileId: number, newCategory: string): Observable<any> {
    const updateURL = `${this.API_SERVER}/${fileId}/category`;
    const categoryData = { category: newCategory };
    return this.httpClient.put(updateURL, categoryData);
  }

  // borrado fisico del documento
  public deleteFile(fileId: number): Observable<any> {
    const deleteURL = `${this.API_SERVER}/delete/${fileId}`;
    return this.httpClient.put(deleteURL, {});
  }

  // Contador de categorías por usuario
public countCategoriesByUser(userId: number): Observable<any> {
  const countURL = `${this.API_SERVER}/count-categories/${userId}`;
  return this.httpClient.get(countURL);
}

// Método para obtener archivos públicos
public getPublicFiles(): Observable<any> {
  const publicFilesURL = `${this.API_SERVER}/public-files`;
  return this.httpClient.get(publicFilesURL);
}


// Método para obtener el almacenamiento utilizado por un usuario
public getStorageUsedByUser(userId: number): Observable<any> {
  const storageURL = `${this.API_SERVER}/storage/${userId}`;
  return this.httpClient.get<ResponseDto<String>>(storageURL);
}

// Método para obtener file por id
public getFileById(fileId: number): Observable<any> {
  const file = `${this.API_SERVER}/${fileId}`;
  return this.httpClient.get(file);
}

}

