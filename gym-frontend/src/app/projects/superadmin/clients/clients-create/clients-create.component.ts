import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StepComponent } from '@/app/shared/components/stepper/step/step.component';
import { StepperComponent } from '@/app/shared/components/stepper/stepper/stepper.component';
import { DetailsStepComponent } from './steps/details-step/details-step.component';

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

    //Steps
    DetailsStepComponent

  ],
  selector: 'app-clients-create',
  templateUrl: './clients-create.component.html',
})
export class ClientsCreateComponent implements OnInit {
  detailsGroup!: FormGroup;
  form!: FormGroup;


  constructor(private _fb: FormBuilder) { }

  ngOnInit(): void { this._buildForm(); }

  // ── Form ─────────────────────────────────────────────────────────────────
  // Parent only owns form construction — all field logic lives in step components

  private _buildForm(): void {
    this.detailsGroup = this._fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      subdomain: ['', [Validators.required, Validators.maxLength(100)]],
      country: ['', [Validators.maxLength(100)]],
      timezone: ['', [Validators.maxLength(100)]],
      logoUrl: ['', [Validators.maxLength(500)]],
      phone: ['', [Validators.maxLength(20)]],
      adminEmail: ['', [Validators.required, Validators.maxLength(255)]],
      internalNotes: ['', []],
    });


    this.form = this._fb.group({
      personal: this.detailsGroup,

    });
  }
 

  onSubmit(): void {
    debugger
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    console.log('Payload:', this.form.getRawValue());
    setTimeout(() => { }, 1500);
  }

}