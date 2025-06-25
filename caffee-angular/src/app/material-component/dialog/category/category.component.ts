import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CategoryService} from '../../../services/category.service';
import {SnackbarService} from '../../../services/snackbar.service';
import {GlobalConstants} from '../../../shared/global-constants';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  onAddCategory = new EventEmitter();
  onEditCategory = new EventEmitter();
  categoryForm: any = FormGroup;
  dialogAction: any = 'Add';
  action: any = 'Add';
  responseMessage: any;
  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any,
              private fb: FormBuilder,
              private categoryService: CategoryService,
              public dialogRef: MatDialogRef<CategoryComponent>,
              private snackbarService: SnackbarService) { }

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: [null, [Validators.required]]
    });
    if (this.dialogData.action === 'Edit') {
      this.dialogAction = 'Edit';
      this.action = 'update';
      this.categoryForm.patchValue(this.dialogData.data);
    }
  }

  handleSubmit(): void {
    if (this.dialogAction === 'Edit') {
      this.edit();
    } else {
      this.add();
    }
  }

  edit(): void {
    const formData = this.categoryForm.value;
    const data = {
      id: this.dialogData.data.id,
      name: formData.name
    };

    this.categoryService.update(data).subscribe((res: any) => {
      this.dialogRef.close();
      this.onEditCategory.emit();
      this.responseMessage = res.message;
      this.snackbarService.openSnackBar(this.responseMessage, 'success');
    }, (error) => {
      this.dialogRef.close();
      console.log(error);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    });
  }

  add(): void {
    const formData = this.categoryForm.value;
    const data = {
      name: formData.name
    };

    this.categoryService.add(data).subscribe((res: any) => {
      this.dialogRef.close();
      this.onAddCategory.emit();
      this.responseMessage = res.message;
      this.snackbarService.openSnackBar(this.responseMessage, 'success');
    }, (error) => {
      this.dialogRef.close();
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
