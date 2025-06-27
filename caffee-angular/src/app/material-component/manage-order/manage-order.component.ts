import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CategoryService} from '../../services/category.service';
import {ProductService} from '../../services/product.service';
import {SnackbarService} from '../../services/snackbar.service';
import {BillService} from '../../services/bill.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {GlobalConstants} from '../../shared/global-constants';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-manage-order',
  templateUrl: './manage-order.component.html',
  styleUrls: ['./manage-order.component.scss']
})
export class ManageOrderComponent implements OnInit {
  displayedColumn: string[] = ['name', 'category', 'price', 'quantity', 'total', 'edit'];
  dataSource: any = [];
  manageOrderForm: any = FormGroup;
  categorys: any = [];
  products: any = [];
  price: any;
  totalAmount = 0;
  responseMessage: any;
  constructor(private fb: FormBuilder,
              private categoryService: CategoryService,
              private productService: ProductService,
              private snackbarService: SnackbarService,
              private billService: BillService,
              private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.getCategorys();
    this.manageOrderForm = this.fb.group({
      name: [null, [Validators.required, Validators.pattern(GlobalConstants.nameRegex)]],
      email: [null, [Validators.required, Validators.pattern(GlobalConstants.emailRegex)]],
      contactNumber: [null, [Validators.required, Validators.pattern(GlobalConstants.contactNumberRegex)]],
      paymentMethod: [null, [Validators.required]],
      product: [null, [Validators.required]],
      category: [null, [Validators.required]],
      quantity: [null, [Validators.required]],
      price: [null, [Validators.required]],
      total: [0, [Validators.required]]
    });
  }
  getCategorys(): void {
    this.categoryService.getFilteredCategorys().subscribe((res: any) => {
      this.ngxService.stop();
      this.categorys = res;
    }, (error) => {
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
  getProductsByCategory(value: any): void {
    this.productService.getProductsByCategory(value.id).subscribe((res: any) => {
      this.products = res;
      this.manageOrderForm.controls.price.setValue('');
      this.manageOrderForm.controls.quantity.setValue('');
      this.manageOrderForm.controls.total.setValue(0);
    }, (error) => {
      console.log(error);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    });
  }
  getProductDetails(value: any): void {
    this.productService.getById(value.id).subscribe((res: any) => {
      this.price = res.price;
      this.manageOrderForm.controls.price.setValue(res.price);
      this.manageOrderForm.controls.quantity.setValue('1');
      this.manageOrderForm.controls.total.setValue(this.price * 1);
    }, (error: any) => {
      console.log(error);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    });
  }
  setQuantity(value: any): void {
    const temp = this.manageOrderForm.controls.quantity.value;
    if (temp > 0) {
      this.manageOrderForm.controls.total.setValue(
        this.manageOrderForm.controls.quantity.value * this.manageOrderForm.controls.price.value);
    } else if (temp !== '') {
      this.manageOrderForm.controls.quantity.setValue('1');
      this.manageOrderForm.controls.total.setValue(
        this.manageOrderForm.controls.quantity.value * this.manageOrderForm.controls.price.value);
    }
  }
  validateProductAdd(): boolean {
   if (this.manageOrderForm.controls.total.value === 0 ||
        this.manageOrderForm.controls.total.value === null ||
        this.manageOrderForm.controls.quantity.value <= 0) {
     return true;
   } else {
     return false;
   }
  }
  validateSubmit(): boolean {
    if (this.totalAmount === 0 || this.manageOrderForm.controls.name.value === null
      || this.manageOrderForm.controls.email.value === null
      || this.manageOrderForm.controls.contactNumber.value === null
      || this.manageOrderForm.controls.paymentMethod.value === null) {
      return true;
    } else {
      return false;
    }
  }
  add(): void {
    const formData = this.manageOrderForm.value;
    const productName = this.dataSource.find((e: { id: number }) => e.id === formData.product.id);
    if (productName === undefined) {
      this.totalAmount = this.totalAmount + formData.total;
      this.dataSource.push({
        id: formData.product.id,
        name: formData.product.name,
        category: formData.category.name,
        quantity: formData.quantity,
        price: formData.price, total: formData.total
      });
      this.dataSource = [...this.dataSource];
      this.snackbarService.openSnackBar(GlobalConstants.productAdded, 'success');
    } else {
      this.snackbarService.openSnackBar(GlobalConstants.productExistError, GlobalConstants.error);
    }
  }
  handleDeleteAction(value: any, element: any): void {
    this.totalAmount = this.totalAmount - element.total;
    this.dataSource.splice(value, 1);
    this.dataSource = [...this.dataSource];
  }
  submitAction(): void {
    const formData = this.manageOrderForm.value;
    const data = {
      name: formData.name,
      email: formData.email,
      contactNumber: formData.contactNumber,
      paymentMethod: formData.paymentMethod,
      totalAmout: this.totalAmount.toString(),
      productDetails: JSON.stringify(this.dataSource)
    };
    this.ngxService.start();
    this.billService.generateReport(data).subscribe((res: any) => {
      this.downloadFile(res.uuid);
      this.manageOrderForm.reset();
      this.dataSource = [];
      this.totalAmount = 0;
    }, (error: any) => {
      console.log(error);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    });
  }
  downloadFile(fileName: string): void {
    const data = {uuid: fileName};
    this.billService.getPdf(data).subscribe((res: any) => {
      saveAs(res, fileName + '.pdf');
      this.ngxService.stop();
    });
  }
}
