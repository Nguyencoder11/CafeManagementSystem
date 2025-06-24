import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../services/user.service';
import {MatDialogRef} from '@angular/material/dialog';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {SnackbarService} from '../services/snackbar.service';
import {GlobalConstants} from '../shared/global-constants';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: any = FormGroup;
  responseMessage: any;
  constructor(private fb: FormBuilder,
              private userService: UserService,
              public dialogRef: MatDialogRef<ForgotPasswordComponent>,
              private ngxService: NgxUiLoaderService,
              private snackbarService: SnackbarService) { }

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: [null, [Validators.required, Validators.pattern(GlobalConstants.emailRegex)]]
    });
  }

  handleSubmit(): void {
    this.ngxService.start();
    const formData = this.forgotPasswordForm.value;
    const data = {
      email: formData.email
    };
    this.userService.forgotPassword(data).subscribe((res: any) => {
      this.ngxService.stop();
      this.responseMessage = res?.message;
      this.dialogRef.close();
      this.snackbarService.openSnackBar(this.responseMessage, '');
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
