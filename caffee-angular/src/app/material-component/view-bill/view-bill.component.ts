import { Component, OnInit } from '@angular/core';
import {BillService} from '../../services/bill.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {SnackbarService} from '../../services/snackbar.service';
import {Router} from '@angular/router';
import {MatTableDataSource} from '@angular/material/table';
import {GlobalConstants} from '../../shared/global-constants';
import {ViewBillProductsComponent} from '../dialog/view-bill-products/view-bill-products.component';
import {ConfirmationComponent} from '../dialog/confirmation/confirmation.component';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-view-bill',
  templateUrl: './view-bill.component.html',
  styleUrls: ['./view-bill.component.scss']
})
export class ViewBillComponent implements OnInit {
  displayColumns: string[] = ['name', 'email', 'contactNumber', 'paymentMethod', 'total', 'view'];
  dataSource: any;
  responsMessage: any;
  constructor(private billService: BillService,
              private ngxService: NgxUiLoaderService,
              private dialog: MatDialog,
              private snackbarService: SnackbarService,
              private router: Router) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }

  tableData(): void {
    this.billService.getBills().subscribe((res: any) => {
      this.ngxService.stop();
      this.dataSource = new MatTableDataSource(res);
    }, (error: any) => {
      this.ngxService.stop();
      console.log(error);
      if (error.error?.message) {
        this.responsMessage = error.error?.message;
      } else {
        this.responsMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responsMessage, GlobalConstants.error);
    });
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  handleViewAction(values: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      data: values
    };
    dialogConfig.width = '100%';
    const dialogRef = this.dialog.open(ViewBillProductsComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
  }
  handleDeleteAction(values: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'delete' + values.name + ' bill',
      confirmation: true
    };
    const dialogRef = this.dialog.open(ConfirmationComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res) => {
      this.ngxService.start();
      this.deleteBill(values.id);
      dialogRef.close();
    });
  }
  deleteBill(id: any): void {
    this.billService.delete(id).subscribe((res: any) => {
      this.ngxService.stop();
      this.tableData();
      this.responsMessage = res.message;
      this.snackbarService.openSnackBar(this.responsMessage, 'success');
    }, (error: any) => {
      this.ngxService.stop();
      console.log(error);
      if (error.error?.message) {
        this.responsMessage = error.error?.message;
      } else {
        this.responsMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responsMessage, GlobalConstants.error);
    });
  }
  downloadReportAction(values: any): void {
    this.ngxService.start();
    const data = {
      name: values.name,
      email: values.email,
      uuid: values.uuid,
      contactNumber: values.constructor,
      paymentMethod: values.paymentMethod,
      totalAmount: values.total.toString(),
      productDetails: values.productDetails
    };
    this.downloadFile(values.uuid, data);
  }
  downloadFile(filename: string, data: any): void {
    this.billService.getPdf(data).subscribe((res: any) => {
      saveAs(res, filename + '.pdf');
      this.ngxService.stop();
    });
  }
}
