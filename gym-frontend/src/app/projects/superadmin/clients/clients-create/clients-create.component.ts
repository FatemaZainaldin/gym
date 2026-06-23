import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  isEditMode = false;
  isLoadingData = false;

  form!: FormGroup;
  id: string | null = null;

  private readonly _fb = inject(FormBuilder);
  private clientsService = inject(ClientsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this._buildForm();
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.isEditMode = true;
      this.getClientById(this.id);
    }
  }

  private _buildForm(): void {
    this.detailsGroup = this._fb.group({
      name:          ['', [Validators.required, Validators.maxLength(150)]],
      subdomain:     ['', [Validators.required, Validators.maxLength(100)]],
      country:       ['', [Validators.maxLength(100)]],
      timezone:      ['', [Validators.maxLength(100)]],
      logoUrl:       ['', [Validators.maxLength(500)]],
      phone:         ['', [Validators.maxLength(20)]],
      adminEmail:    ['', [Validators.required, Validators.maxLength(255)]],
      internalNotes: [''],
    });

    this.subscriptionGroup = this._fb.group({
      plan:        ['', [Validators.required, Validators.maxLength(150)]],
      trialEndsAt: [''],
    });

    this.form = this._fb.group({
      personal:     this.detailsGroup,
      subscription: this.subscriptionGroup,
    });
  }

  getClientById(id: string): void {
    this.isLoadingData = true;
    this.form.disable(); // lock form while fetching

    this.clientsService.getClientById(id).subscribe({
      next: (res) => {
        res = res?.data;
        // patch each group separately so structure stays clean
        this.detailsGroup.patchValue({
          name:          res.name,
          subdomain:     res.subdomain,
          country:       res.country,
          timezone:      res.timezone,
          logoUrl:       res.logoUrl,
          phone:         res.phone,
          adminEmail:    res.adminEmail,
          internalNotes: res.internalNotes,
        });
        this.subscriptionGroup.patchValue({
          plan:        res.plan,
          trialEndsAt: res.trialEndsAt,
        });
        this.form.enable();
        this.isLoadingData = false;
      },
      error: () => {
        this.isLoadingData = false;
        this.form.enable();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { personal, subscription } = this.form.getRawValue();
    const body = { ...personal, ...subscription };

    const request$ = this.isEditMode
      ? this.clientsService.updateClient(this.id!, body)
      : this.clientsService.createClient(body);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/clients']);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}