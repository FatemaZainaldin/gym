import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-personal-step',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './personal-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  photoPreview: string | null = null;

  getInitials(): string {
    const f = this.formGroup.get('first_name')?.value?.trim() || '';
    const l = this.formGroup.get('last_name')?.value?.trim()  || '';
    return ((f[0] || '') + (l[0] || '')).toUpperCase() || 'TR';
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => (this.photoPreview = e.target?.result as string);
    reader.readAsDataURL(file);
  }
}