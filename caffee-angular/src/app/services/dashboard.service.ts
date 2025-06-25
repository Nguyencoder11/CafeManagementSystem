import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  url = environment.apiUrl;
  constructor(private httpClient: HttpClient) { }
  getDetails(): Observable<any> {
    return this.httpClient.get(this.url + '/dashboard/details');
  }
}
