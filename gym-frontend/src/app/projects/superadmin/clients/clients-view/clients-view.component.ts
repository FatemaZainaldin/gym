import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastService } from '@/app/core/toast/toast.service';
import { ConfirmStepComponent } from '../clients-create/steps/confirm-step/confirm-step.component';
import { ClientsService } from '../clients.service';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ConfirmStepComponent,
    

  ],
  selector: 'app-clients-view',
  templateUrl: './clients-view.component.html',
})
export class ClientsViewComponent implements OnInit {

  form!: FormGroup;
  detailsGroup!: FormGroup;
  subscriptionGroup!: FormGroup;

  isSubmitting = false;
  isEditMode = false;

  id: string | null = null;

  private router = inject(Router);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private readonly _fb = inject(FormBuilder);
  private clientsService = inject(ClientsService);

  ngOnInit(): void {
    this._buildForm();
    this.id = this.route.snapshot.paramMap.get('id');
    this.getClientById(this.id!);
  }

  private _buildForm(): void {
    this.detailsGroup = this._fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      subdomain: ['', [Validators.required, Validators.maxLength(100)]],
      country: ['', [Validators.required, Validators.maxLength(100)]],
      timezone: ['', [Validators.required, Validators.maxLength(100)]],
      logoUrl: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      adminEmail: ['', [Validators.required, Validators.maxLength(255), Validators.email]],
      internalNotes: [''],
    });

    this.subscriptionGroup = this._fb.group({
      plan: ['', [Validators.required, Validators.maxLength(150)]],
      trialEndsAt: [null],
    });

    this.form = this._fb.group({
      personal: this.detailsGroup,
      subscription: this.subscriptionGroup,
    });
  }

  getClientById(id: string): void {
    this.form.disable();

    this.clientsService.getClientById(id).subscribe({
      next: (res) => {
        res = res?.data;
        this.detailsGroup.patchValue({
          name: this.isEditMode ? res.name : `${res.name} COPY`,
          subdomain: this.isEditMode ? res.subdomain : `${res.subdomain} COPY`,
          country: res.country,
          timezone: res.timezone,
          logoUrl: res.logoUrl,
          phone: res.phone,
          adminEmail: this.isEditMode ? res.adminEmail : null,
          internalNotes: res.internalNotes,
        });
        this.subscriptionGroup.patchValue({
          plan: res.plan,
          trialEndsAt: res.trialEndsAt,
        });
        this.form.enable();
      },
      error: () => {
        this.form.enable();
      }
    });
  }


  home() {
    return this.router.navigateByUrl(`/superadmin/clients`);
  }
}