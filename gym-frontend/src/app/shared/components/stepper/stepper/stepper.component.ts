import {
  Component,
  ContentChildren,
  QueryList,
  Output,
  EventEmitter,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StepComponent } from '../step/step.component';

@Component({
  selector: 'app-stepper',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './stepper.component.html',
})
export class StepperComponent implements AfterContentInit {

  @ContentChildren(StepComponent) stepComponents!: QueryList<StepComponent>;

  /** Emits the index of the step the user moved TO */
  @Output() stepChange = new EventEmitter<number>();

  /** Emits when the user clicks submit on the last step */
  @Output() submitted  = new EventEmitter<void>();

  currentStep  = 0;
  furthestStep = 0;

  get steps(): StepComponent[] {
    return this.stepComponents?.toArray() ?? [];
  }

  get isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  constructor(private _cdr: ChangeDetectorRef) {}

  ngAfterContentInit(): void {
    this._syncActiveStep();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  next(): void {
    const current = this.steps[this.currentStep];
    if (current.formGroup && !current.optional) {
      Object.values(current.formGroup.controls).forEach(c => c.markAsTouched());
      if (current.formGroup.invalid) {
        this._cdr.markForCheck();
        return;
      }
    }

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      if (this.currentStep > this.furthestStep) this.furthestStep = this.currentStep;
      this.stepChange.emit(this.currentStep);
      this._syncActiveStep();
      this._scrollTop();
    }
  }

  prev(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.stepChange.emit(this.currentStep);
      this._syncActiveStep();
      this._scrollTop();
    }
  }

  goTo(index: number): void {
    if (index >= 0 && index <= this.furthestStep) {
      this.currentStep = index;
      this.stepChange.emit(this.currentStep);
      this._syncActiveStep();
      this._scrollTop();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _syncActiveStep(): void {
    this.steps.forEach((s, i) => (s.active = i === this.currentStep));
    this._cdr.markForCheck();
  }

  private _scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}