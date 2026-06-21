import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FileUploadConfig, UploadedFile } from '@/app/shared/components/file-upload/file-upload.types';
import { FileUploadComponent } from '@/app/shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-details-step',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    FileUploadComponent
  ],
  templateUrl: './details-step.component.html',
})
export class DetailsStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;



}