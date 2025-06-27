import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  url = environment.apiUrl;
  constructor(private httpClient: HttpClient) { }
  generateReport(data: any): Observable<any> {
    return this.httpClient.post(this.url + '/bill/generateReport', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
  getPdf(data: any): Observable<any> {
   return this.httpClient.post(this.url + '/bill/getPdf', data, {
     responseType: 'blob'
   });
  }
  getBills(): Observable<any> {
    return this.httpClient.get(this.url + '/bill/getBills');
  }
  delete(id: any): Observable<any> {
    return this.httpClient.post(this.url + `/bill/delete/${id}`, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
