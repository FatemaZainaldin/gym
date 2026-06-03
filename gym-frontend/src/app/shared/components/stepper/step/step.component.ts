import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-step',
  imports: [CommonModule],
  host: { '[style.display]': 'active ? "contents" : "none"' },
  templateUrl: './step.component.html',
})
export class StepComponent {
  @Input() label!: string;
  @Input() formGroup?: FormGroup;
  @Input() optional = false;

  active = false;

  constructor(private _cdr: ChangeDetectorRef) { }

  /** Called by StepperComponent to trigger re-render after active changes */
  markForCheck(): void {
    this._cdr.markForCheck();
  }
}