
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FileUploadComponent } from '@/app/shared/components/file-upload/file-upload.component';
import { ErrorComponent } from '@/app/shared/components/form-error/form-error.component';
@Component({
  selector: 'app-details-step',
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    FileUploadComponent,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ErrorComponent,
  ],
  templateUrl: './details-step.component.html',
})
export class DetailsStepComponent implements OnInit {
  ngOnInit(): void {
    this.formGroup.get('logoUrl')?.valueChanges.subscribe(val => {
      console.log(val); // fires every time a file is uploaded or removed
    });
  }
  
  @Input({ required: true }) formGroup!: FormGroup;

}