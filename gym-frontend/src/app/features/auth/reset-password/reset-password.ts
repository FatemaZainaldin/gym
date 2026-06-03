import { Component, inject, signal } from "@angular/core";
import {
  form,
  FormField,
  required,
  submit,
  validate,
} from "@angular/forms/signals";
import { MatButtonModule } from "@angular/material/button";
import { MatCard } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { Router } from "@angular/router";
import { ToastService } from "@/app/core/toast/toast.service";
import { AuthService } from "../auth.service";

@Component({
  selector: "auth-reset-password",
  templateUrl: "./reset-password.html",
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    FormField,
    MatCard,
  ],
})
export default class AuthResetPassword {
  // Dependencies
  private router = inject(Router);
  private toast = inject(ToastService);
  private authService = inject(AuthService);

  // State
  protected resetPasswordFormModel = signal({
    password: "",
    passwordValidation: "",
  });
  protected resetPasswordForm = form(this.resetPasswordFormModel, (form) => {
    required(form.password, { message: "You must enter a password" });
    required(form.passwordValidation, {
      message: "You must enter a password",
    });
    validate(form.passwordValidation, (ctx) => {
      const password = ctx.valueOf(form.password);
      const passwordValidation = ctx.value();

      if (!password || !passwordValidation) return null;

      if (password !== passwordValidation) {
        return {
          kind: "mismatch",
          message: "The passwords do not match",
        };
      }

      return null;
    });
  });

  resetPassword(event: Event) {
    event.preventDefault();
    this.authService.resetPassword({ password: this.resetPasswordFormModel().password }).subscribe({
      next: (res) => {
        this.toast.showMessage(res?.message, 'success')
        this.router.navigateByUrl("/auth/sign-in");

      },

      error: (err) => {
        this.toast.showMessage(err.error?.message, 'error')
      },
    });
  }
}
