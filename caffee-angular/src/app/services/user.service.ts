import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url = environment.apiUrl;
  constructor(private httpClient: HttpClient) { }
  signUp(data: any): Observable<any> {
    return this.httpClient.post(this.url + '/user/signup', data,
      {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      });
  }
}
