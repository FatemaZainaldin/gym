import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

type ClientPlanKey = 'free' | 'starter' | 'pro' | 'enterprise';

interface ClientPersonalSummary {
  name?: string;
  subdomain?: string;
  country?: string;
  timezone?: string;
  adminEmail?: string;
}

interface ClientSubscriptionSummary {
  plan?: ClientPlanKey;
  trialEndsAt?: string;
}

interface ClientCreateFormValue {
  personal?: ClientPersonalSummary;
  subscription?: ClientSubscriptionSummary;
}

@Component({
  selector: 'app-confirm-step',
  imports: [CommonModule, MatIconModule],
  templateUrl: './confirm-step.component.html',
})
export class ConfirmStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() isSubmitting = false;


  private get formValue(): ClientCreateFormValue {
    return this.formGroup.value as ClientCreateFormValue;
  }

  get personalValue(): ClientPersonalSummary {
    return this.formValue.personal ?? {};
  }

  get subscriptionValue(): ClientSubscriptionSummary {
    return this.formValue.subscription ?? {};
  }

  get planLabel(): string {
    const plan = this.subscriptionValue.plan;
    if (!plan) {
      return 'Not selected';
    }

    const planLabels: Record<ClientPlanKey, string> = {
      free: 'Free • $0/mo',
      starter: 'Starter • $49/mo',
      pro: 'Pro • $149/mo',
      enterprise: 'Enterprise • Custom',
    };

    return planLabels[plan];
  }

  get trialLabel(): string {
    const trialEndsAt = this.subscriptionValue.trialEndsAt;
    if (!trialEndsAt) {
      return 'No trial selected';
    }

    const endsAt = new Date(trialEndsAt);
    if (Number.isNaN(endsAt.getTime())) {
      return 'No trial selected';
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.round((endsAt.getTime() - now.getTime()) / 86_400_000);
    return diffDays > 0 ? `${diffDays} days trial` : 'Trial expires soon';
  }

  get statusLabel(): string {
    return this.subscriptionValue.trialEndsAt ? 'Trial (pending activation)' : 'Ready to activate';
  }
}
