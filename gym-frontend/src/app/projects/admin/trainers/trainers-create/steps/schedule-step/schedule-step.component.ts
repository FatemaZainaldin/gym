import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

@Component({
  selector: 'app-schedule-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './schedule-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  readonly DAYS_OF_WEEK      = DAYS_OF_WEEK;
  readonly SESSION_DURATIONS = [30, 45, 60, 90];

  constructor(private _fb: FormBuilder) {}

  get availabilityArray(): FormArray {
    return this.formGroup.get('availability') as FormArray;
  }

  getDayGroup(i: number): FormGroup {
    return this.availabilityArray.at(i) as FormGroup;
  }

  getShifts(di: number): FormArray {
    return this.getDayGroup(di).get('shifts') as FormArray;
  }

  toggleDay(di: number): void {
    const grp    = this.getDayGroup(di);
    const active = !grp.get('active')!.value;
    grp.get('active')!.setValue(active);
    const shifts = this.getShifts(di);
    if (active && shifts.length === 0) shifts.push(this._createShift());
    if (!active) while (shifts.length) shifts.removeAt(0);
  }

  addShift(di: number): void {
    if (this.getShifts(di).length < 3) {
      this.getShifts(di).push(this._createShift('16:00', '20:00'));
    }
  }

  removeShift(di: number, si: number): void {
    if (this.getShifts(di).length > 1) this.getShifts(di).removeAt(si);
  }

  private _createShift(start = '08:00', end = '14:00'): FormGroup {
    return this._fb.group({ start_time: [start], end_time: [end] });
  }
}