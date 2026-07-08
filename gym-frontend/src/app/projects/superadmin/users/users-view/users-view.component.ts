import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastService } from '@/app/core/toast/toast.service';
import { StepComponent } from '@/app/shared/components/stepper/step/step.component';
import { StepperComponent } from '@/app/shared/components/stepper/stepper/stepper.component';
import { UsersService } from '../users.service';
import { ConfirmStepComponent } from '../users-create/steps/confirm-step/confirm-step.component';
import { User } from '../users.model';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,

    //Steps
    ConfirmStepComponent

  ],
  selector: 'app-users-view',
  templateUrl: './users-view.component.html',
})
export class UsersViewComponent implements OnInit {

  data = signal<User | null>(null);
  id = signal<string>('');

  private router = inject(Router);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private readonly _fb = inject(FormBuilder);
  private usersService = inject(UsersService);

  ngOnInit(): void {
    this.id.set(this.route.snapshot.paramMap.get('id')!);
    this.getUserById();
  }



  getUserById(): void {
    if(!this.id()){ return;}
    this.usersService.getUserById(this.id()).subscribe({
      next: (res) => {
        this.data.set(res?.data)
      },
      error: (err) => {
        this.toast.showMessage(err?.error?.message, 'error');
      }
    });
  }


  home() {
    return this.router.navigateByUrl(`/superadmin/users`);

  }
}