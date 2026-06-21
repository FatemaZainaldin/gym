import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { StepComponent } from '@/app/shared/components/stepper/step/step.component';
import { ConfirmStepComponent } from './steps/confirm-step/confirm-step.component';
import { DetailsStepComponent } from './steps/details-step/details-step.component';
import { SubscriptionStepComponent } from './steps/subscription-step/subscription-step.component';
import { StepperComponent } from '@/app/shared/components/stepper/stepper/stepper.component';
import { ClientsService } from '../clients.service';

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
    DetailsStepComponent,
    SubscriptionStepComponent,
    ConfirmStepComponent

  ],
  selector: 'app-clients-create',
  templateUrl: './clients-create.component.html',
})
export class ClientsCreateComponent implements OnInit {
  detailsGroup!: FormGroup;
  subscriptionGroup!: FormGroup;
  isSubmitting = false;

  form!: FormGroup;

  private readonly _fb = inject(FormBuilder);
  private clientsService = inject(ClientsService)

  ngOnInit(): void {
    this._buildForm();
  }

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

    this.subscriptionGroup = this._fb.group({
      plan: ['', [Validators.required, Validators.maxLength(150)]],
      trialEndsAt: [''],
    });

    this.form = this._fb.group({
      personal: this.detailsGroup,
      subscription: this.subscriptionGroup,
    });
  }


  onSubmit(): void {
    this.isSubmitting = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { personal, subscription } = this.form.getRawValue();
    const body = {
      ...personal,
      ...subscription,
    };

    this.clientsService.createClient(body).subscribe(res => {

    });
  }

}