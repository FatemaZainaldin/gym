import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastService } from '@/app/core/toast/toast.service';
import { StepComponent } from '@/app/shared/components/stepper/step/step.component';
import { StepperComponent } from '@/app/shared/components/stepper/stepper/stepper.component';
import { UsersService } from '../users.service';
import { ConfirmStepComponent } from './steps/confirm-step/confirm-step.component';
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
    DetailsStepComponent,
    ConfirmStepComponent

  ],
  selector: 'app-users-create',
  templateUrl: './users-create.component.html',
})
export class UsersCreateComponent implements OnInit {

  form!: FormGroup;
  detailsGroup!: FormGroup;

  isSubmitting = false;
  isEditMode = false;

  id: string | null = null;

  private router = inject(Router);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private readonly _fb = inject(FormBuilder);
  private usersService = inject(UsersService);

  ngOnInit(): void {
    this._buildForm();
    const segments = this.route.snapshot.url.map(s => s.path);
    this.id = this.route.snapshot.paramMap.get('id');

    const isCopy = segments?.includes('new') && this.id;
    const isEdit = segments?.includes('edit');

    this.isEditMode = isEdit;
    if (isCopy || isEdit) {
      this.getUserById(this.id!);
    }

  }

  private _buildForm(): void {
    this.detailsGroup = this._fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(150)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.maxLength(255), Validators.email]],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      avatar: ['', [Validators.required]],
      role: ['', [Validators.required]],
      mustChangePassword:[false],
      subdomain: ['', [Validators.maxLength(100)]]
    });



    this.form = this._fb.group({
      personal: this.detailsGroup,
    });
  }

  getUserById(id: string): void {
    this.form.disable();

    this.usersService.getUserById(id).subscribe({
      next: (res) => {
        res = res?.data;
        this.detailsGroup.patchValue({
          firstName: this.isEditMode ? res.firstName : `${res.firstName} COPY`,
          lastName: this.isEditMode ? res.lastName : `${res.lastName} COPY`,
          email: this.isEditMode ? res.email : `${res.email} COPY`,
          avatar: res.logoUrl,
          phone: res.phone,
          role: res.role,
          mustChangePassword: res.mustChangePassword,
          subdomain: res.subdomain
        });

        this.form.enable();
      },
      error: () => {
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
    const { personal } = this.form.getRawValue();
    const body = { ...personal };
    delete body.mustChangePassword;

    const request$ = this.isEditMode
      ? this.usersService.updateUser(this.id!, body)
      : this.usersService.createUser(body);

    request$.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toast.showMessage(res?.message, 'success');
        this.home();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.showMessage(err?.error?.message, 'error');

      }
    });
  }

  home() {
    return this.router.navigateByUrl(`/superadmin/users`);

  }
}