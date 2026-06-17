import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export const SPECIALIZATIONS = [
  'Weight loss', 'Muscle building', 'Cardio & endurance',
  'Yoga & flexibility', 'CrossFit', 'Boxing & MMA',
  'Pilates', 'Rehabilitation', 'Nutrition coaching',
  'Kids & teens', 'Senior fitness', 'Prenatal fitness',
];

export const LANGUAGES = ['Arabic', 'English', 'Hindi', 'Urdu', 'French', 'German'];

export const EDUCATION_LEVELS = [
  'High school diploma', "Bachelor's degree", "Master's degree", 'PhD', 'Other',
];

@Component({
  selector: 'app-qualifications-step',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './qualifications-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualificationsStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  readonly SPECIALIZATIONS  = SPECIALIZATIONS;
  readonly LANGUAGES        = LANGUAGES;
  readonly EDUCATION_LEVELS = EDUCATION_LEVELS;

  isSelected(ctrl: 'specializations' | 'languages', value: string): boolean {
    return (this.formGroup.get(ctrl)!.value as string[]).includes(value);
  }

  toggleSelection(ctrl: 'specializations' | 'languages', value: string): void {
    const c    = this.formGroup.get(ctrl)!;
    const list = [...(c.value as string[])];
    const idx  = list.indexOf(value);
    idx === -1 ? list.push(value) : list.splice(idx, 1);
    c.setValue(list);
  }
}