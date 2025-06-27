import { Component, OnInit } from '@angular/core';
import {NgxUiLoaderService} from "ngx-ui-loader";
import {UserService} from "../../services/user.service";
import {SnackbarService} from "../../services/snackbar.service";
import {MatTableDataSource} from "@angular/material/table";
import {GlobalConstants} from "../../shared/global-constants";

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss']
})
export class ManageUserComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'contactNumber', 'status'];
  dataSource: any;
  responseMessage: any;
  constructor(private ngxService: NgxUiLoaderService,
              private userService: UserService,
              private snackbarService: SnackbarService) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }
  tableData(): void {
    this.userService.getUsers().subscribe((res: any) => {
      this.ngxService.stop();
      this.dataSource = new MatTableDataSource(res);
    }, (error: any) => {
      this.ngxService.stop();
      console.log(error);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    });
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  onChange(status: any, Id: any): void {
    this.ngxService.start();
    const data = {
      status: status.toString(),
      id: Id
    };
    this.userService.update(data).subscribe((res: any) => {
      this.ngxService.stop();
      this.responseMessage = res?.message;
      this.snackbarService.openSnackBar(this.responseMessage, 'success');
    }, (error: any) => {
      this.ngxService.stop();
      console.log(error);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    });
  }
}
