import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {MatDialogRef} from '@angular/material/dialog';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {SnackbarService} from '../services/snackbar.service';
import {GlobalConstants} from '../shared/global-constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;
  loginForm!: FormGroup;
  responseMessage: any;
  constructor(private fb: FormBuilder,
              private router: Router,
              private userService: UserService,
              public dialogRef: MatDialogRef<LoginComponent>,
              private ngxService: NgxUiLoaderService,
              private snackbarService: SnackbarService) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.pattern(GlobalConstants.emailRegex)]],
      password: [null, Validators.required]
    });
  }

  handleSubmit(): void {
    this.ngxService.start();
    const formData = this.loginForm.value;
    const data = {
      email: formData.email,
      password: formData.password
    };
    this.userService.login(data).subscribe((res: any) => {
      this.ngxService.stop();
      this.dialogRef.close();
      localStorage.setItem('token', res.token);
      this.router.navigate(['/cafe/dashboard']);
    }, (error) => {
      this.ngxService.stop();
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    });
  }
}
