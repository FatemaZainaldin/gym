import { Component, Input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../users.model';

type ConfirmStepData = User | null | Signal<User | null>;

@Component({
  selector: 'app-confirm-step',
  imports: [CommonModule, MatIconModule],
  templateUrl: './confirm-step.component.html',
})
export class ConfirmStepComponent {
  @Input() data?: ConfirmStepData;

  get user(): User {
    if (!this.data) {
      return {} as User;
    }

    if (typeof this.data === 'function') {
      return this.data() ?? ({} as User);
    }

    return this.data;
  }
}
