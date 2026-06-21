import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule],
  selector: 'app-subscription-step',
  templateUrl: './subscription-step.component.html',
})
export class SubscriptionStepComponent implements OnInit, OnDestroy {
  @Input({ required: true }) formGroup!: FormGroup;
  trialEnabled = false;

  private _trialEndsAtSub?: Subscription;

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._trialEndsAtSub?.unsubscribe();
  }

  updateTrialEndsAt(duration: string | number): void {
    const trialEndsAtControl = this.formGroup.get('trialEndsAt');
    if (!trialEndsAtControl) {
      return;
    }

    if (!this.trialEnabled) {
      trialEndsAtControl.setValue('');
      return;
    }

    const days = Number(duration) || 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    now.setDate(now.getDate() + days);
    trialEndsAtControl.setValue(now.toISOString());
  }

  onTrialChange(): void {
    this.trialEnabled = !this.trialEnabled;
  }
}
