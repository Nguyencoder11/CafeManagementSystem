import { Component, OnInit } from '@angular/core';
import {ProductService} from '../../services/product.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {SnackbarService} from '../../services/snackbar.service';
import {Route, Router} from '@angular/router';
import {MatTableDataSource} from '@angular/material/table';
import {GlobalConstants} from '../../shared/global-constants';
import {ProductComponent} from '../dialog/product/product.component';
import {ConfirmationComponent} from '../dialog/confirmation/confirmation.component';

@Component({
  selector: 'app-manage-product',
  templateUrl: './manage-product.component.html',
  styleUrls: ['./manage-product.component.scss']
})
export class ManageProductComponent implements OnInit {
  displayedColumns: string[] = ['name', 'categoryName', 'description', 'price', 'edit'];
  dataSource: any;
  length1: any;
  responseMessage: any;
  constructor(private productService: ProductService,
              private ngxService: NgxUiLoaderService,
              private dialog: MatDialog,
              private snackbarService: SnackbarService,
              private router: Router) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }

  tableData(): void {
    this.productService.getProducts().subscribe((res: any) => {
      this.ngxService.stop();
      this.dataSource = new MatTableDataSource(res);
    }, (error) => {
      this.ngxService.stop();
      console.log(error.error?.message);
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

  handleAddAction(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'Add'
    };
    dialogConfig.width = '850px';
    const dialogRef = this.dialog.open(ProductComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onAddProduct.subscribe((res: any) => {
      this.tableData();
    });
  }

  handleEditAction(values: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'Edit',
      data: values
    };
    dialogConfig.width = '850px';
    const dialogRef = this.dialog.open(ProductComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onEditProduct.subscribe((res: any) => {
      this.tableData();
    });
  }

  handleDeleteAction(values: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'delete' + values.name + ' product',
      confirmation: true
    };
    const dialogRef = this.dialog.open(ConfirmationComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.deleteProduct(values.id);
      dialogRef.close();
    });
  }

  deleteProduct(id: any): void {
    this.productService.delete(id).subscribe((res: any) => {
      this.ngxService.stop();
      this.tableData();
      this.responseMessage = res?.message;
      this.snackbarService.openSnackBar(this.responseMessage, 'success');
    }, (error: any) => {
      this.ngxService.stop();
      console.log(error.error?.message);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    });
  }

  onChange(status: any, cateId: any): void {
    this.ngxService.stop();
    const data = {
      status: status.toString(),
      id: cateId
    };
    this.productService.updateStatus(data).subscribe((res: any) => {
      this.ngxService.stop();
      this.responseMessage = res?.message;
      this.snackbarService.openSnackBar(this.responseMessage, 'success');
    }, (error: any) => {
      this.ngxService.stop();
      console.log(error.error?.message);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    });
  }

}
