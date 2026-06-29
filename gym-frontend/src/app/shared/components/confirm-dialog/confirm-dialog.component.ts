import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmActionType, ConfirmDialogData, ConfirmDialogResult } from './confirm-dialog.model.ts';



// ── Auto-config per action type ─────────────────────────────────────────────
const ACTION_CONFIG: Record<ConfirmActionType, {
  title: string;
  message: string;
  confirmLabel: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  confirmClasses: string;
}> = {
  delete: {
    title: 'Delete',
    message: 'This action is permanent and cannot be undone.',
    confirmLabel: 'Delete',
    icon: 'trash',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    confirmClasses: 'bg-red-500 hover:bg-red-600 text-white',
  },
  deactivate: {
    title: 'Deactivate',
    message: 'This will disable access until reactivated.',
    confirmLabel: 'Deactivate',
    icon: 'x',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    confirmClasses: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  suspend: {
    title: 'Suspend',
    message: 'The account will be suspended immediately.',
    confirmLabel: 'Suspend',
    icon: 'pause-circle',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    confirmClasses: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
  activate: {
    title: 'Activate',
    message: 'This will restore access immediately.',
    confirmLabel: 'Activate',
    icon: 'check',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
    confirmClasses: 'bg-green-500 hover:bg-green-600 text-white',
  },
  custom: {
    title: 'Confirm',
    message: 'Are you sure you want to proceed?',
    confirmLabel: 'Confirm',
    icon: 'alert',
    iconBg: 'bg-gray-50',
    iconColor: 'text-gray-500',
    confirmClasses: 'bg-primary hover:opacity-90 text-white',
  },
};

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

  isSubmitting = false;

  // Merge action defaults with any caller overrides
  config = ACTION_CONFIG[this.data.action];

  get title()        { return this.data.title        ?? `${this.config.title}${this.data.itemName ? ' ' + this.data.itemName : ''}`; }
  get message()      { return this.data.message      ?? this.config.message; }
  get confirmLabel() { return this.data.confirmLabel ?? this.config.confirmLabel; }
  get reasonLabel()  { return this.data.reasonLabel  ?? 'Reason'; }
  get acknowledgeLabel() {
    return this.data.acknowledgeLabel ?? 'I understand this action cannot be undone';
  }

  form = this.fb.group({
    reason: [
      '',
      this.data.showReason && this.data.reasonRequired ? [Validators.required] : [],
    ],
    acknowledged: [
      false,
      this.data.requireAcknowledge ? [Validators.requiredTrue] : [],
    ],
  });

  get canConfirm(): boolean {
    return this.form.valid;
  }

  confirm() {
    if (!this.canConfirm) {
      this.form.markAllAsTouched();
      return;
    }
    const result: ConfirmDialogResult = {
      confirmed: true,
      reason: this.data.showReason ? (this.form.value.reason ?? '') : undefined,
    };
    this.dialogRef.close(result);
  }

  cancel() {
    this.dialogRef.close({ confirmed: false });
  }
}