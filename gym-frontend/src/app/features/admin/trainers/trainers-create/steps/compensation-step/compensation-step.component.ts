import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-compensation-step',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './compensation-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompensationStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  readonly SALARY_TYPES = [
    { value: 'monthly',     label: 'Monthly salary' },
    { value: 'per_session', label: 'Per session' },
    { value: 'commission',  label: 'Commission-based' },
    { value: 'hybrid',      label: 'Hybrid' },
  ];

  get salaryType():      string  { return this.formGroup.get('salary_type')!.value; }
  get showMonthly():     boolean { return ['monthly',     'hybrid'].includes(this.salaryType); }
  get showSessionRate(): boolean { return ['per_session', 'hybrid'].includes(this.salaryType); }
  get showCommission():  boolean { return ['commission',  'hybrid'].includes(this.salaryType); }
}