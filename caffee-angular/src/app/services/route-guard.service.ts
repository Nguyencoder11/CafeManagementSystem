import { Injectable } from '@angular/core';
import {AuthService} from './auth.service';
import {ActivatedRouteSnapshot, Router} from '@angular/router';
import {SnackbarService} from './snackbar.service';
import {jwtDecode} from 'jwt-decode';
import {GlobalConstants} from '../shared/global-constants';

@Injectable({
  providedIn: 'root'
})
export class RouteGuardService {

  constructor(public auth: AuthService,
              public router: Router,
              private snackbarService: SnackbarService) { }
  canActivate(router: ActivatedRouteSnapshot): boolean {
    const expectedRoleArray = router.data?.expectedRole;
    const token: string | null = localStorage.getItem('token');
    if (!token) {
      this.handleUnauthorized();
      return false;
    }
    let tokenPayload: any;
    try {
      tokenPayload = jwtDecode(token);
    }
    catch (error) {
      this.handleUnauthorized();
      return false;
    }
    let isRoleValid = false;
    for (const role of expectedRoleArray) {
      if (role === tokenPayload.role) {
        isRoleValid = true;
        break;
      }
    }
    if ((tokenPayload.role === 'user' || tokenPayload.role === 'admin') &&
      this.auth.isAuthenticated() && isRoleValid) {
      return true;
    } else {
      this.snackbarService.openSnackBar(GlobalConstants.unauthorized, GlobalConstants.error);
      this.router.navigate(['/cafe/dashboard']);
      return false;
    }
  }
  private handleUnauthorized(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
