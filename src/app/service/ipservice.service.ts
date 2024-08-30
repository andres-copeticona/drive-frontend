import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IpserviceService {

  constructor(private http: HttpClient) {}

  public getIp(): Observable<{ ip: string }> {
    return this.http.get<{ ip: string }>('https://api.ipify.org?format=json');
   
  }
}
