import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-admin-step',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() isSubmitting = false;

  readonly STATUS_OPTIONS = [
    { value: 'active', label: 'Active', icon: 'check_circle' },
    { value: 'on_leave', label: 'On leave', icon: 'schedule' },
    { value: 'inactive', label: 'Inactive', icon: 'cancel' },
  ];

  setRating(v: number): void { this.formGroup.get('initial_rating')!.setValue(v); }
  getRating(): number { return this.formGroup.get('initial_rating')!.value; }
  setStatus(v: string): void { this.formGroup.get('status')!.setValue(v); }
}