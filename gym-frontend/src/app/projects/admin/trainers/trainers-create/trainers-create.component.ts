import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SPECIALIZATIONS, LANGUAGES, DAYS_OF_WEEK } from '../trainers.model';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StepperComponent } from '@/app/shared/components/stepper/stepper/stepper.component';
import { StepComponent } from '@/app/shared/components/stepper/step/step.component';
import { AdminStepComponent } from './steps/admin-step/admin-step.component';
import { CompensationStepComponent } from './steps/compensation-step/compensation-step.component';
import { PersonalStepComponent } from './steps/personal-step/personal-step.component';
import { QualificationsStepComponent } from './steps/qualifications-step/qualifications-step.component';
import { ScheduleStepComponent } from './steps/schedule-step/schedule-step.component';

export interface WizardStep {
  label: string;
  fields: string[]; // top-level formControl names to validate on Next
}

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,

    // Stepper
    StepperComponent,
    StepComponent,

    // Steps
    PersonalStepComponent,
    QualificationsStepComponent,
    ScheduleStepComponent,
    CompensationStepComponent,
    AdminStepComponent,

  ],
  selector: 'app-trainers-create',
  templateUrl: './trainers-create.component.html',
})
export class TrainersCreateComponent implements OnInit {
  personalGroup!: FormGroup;
  qualGroup!: FormGroup;
  scheduleGroup!: FormGroup;
  compensationGroup!: FormGroup;
  adminGroup!: FormGroup;
  form!: FormGroup;

  isSubmitting = false;

  constructor(private _fb: FormBuilder) { }

  ngOnInit(): void { this._buildForm(); }

  // ── Form ─────────────────────────────────────────────────────────────────
  // Parent only owns form construction — all field logic lives in step components

  private _buildForm(): void {
    this.personalGroup = this._fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      date_of_birth: [null],
      gender: [''],
      phone: ['', Validators.required],
      email: ['', Validators.email],
      nationality: [''],
      national_id: [''],
      bio: [''],
    });

    this.qualGroup = this._fb.group({
      education_level: [''],
      field_of_study: [''],
      years_experience: [null, Validators.min(0)],
      certifications: [''],
      specializations: [[]],
      languages: [['Arabic', 'English']],
    });

    this.scheduleGroup = this._fb.group({
      availability: this._fb.array(
        DAYS_OF_WEEK.map((day, i) => this._fb.group({
          day: [day],
          active: [i < 5],
          shifts: this._fb.array(i < 5 ? [this._shift()] : []),
        }))
      ),
      session_duration_minutes: [60],
      max_clients_per_day: [null, Validators.min(1)],
      contract_start: [null],
      contract_end: [null],
    });

    this.compensationGroup = this._fb.group({
      salary_type: ['monthly', Validators.required],
      monthly_salary: [null, Validators.min(0)],
      session_rate: [null, Validators.min(0)],
      commission_percent: [null, [Validators.min(0), Validators.max(100)]],
    });

    this.adminGroup = this._fb.group({
      instagram: [''],
      tiktok: [''],
      target_monthly_sessions: [null],
      initial_rating: [3],
      status: ['active'],
      admin_notes: [''],
    });

    this.form = this._fb.group({
      personal: this.personalGroup,
      qual: this.qualGroup,
      schedule: this.scheduleGroup,
      compensation: this.compensationGroup,
      admin: this.adminGroup,
    });
  }

  private _shift(start = '08:00', end = '14:00'): FormGroup {
    return this._fb.group({ start_time: [start], end_time: [end] });
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting = true;
    console.log('Payload:', this.form.getRawValue());
    // TODO: this._trainerService.create(this.form.getRawValue()).subscribe(...)
    setTimeout(() => { this.isSubmitting = false; }, 1500);
  }
}