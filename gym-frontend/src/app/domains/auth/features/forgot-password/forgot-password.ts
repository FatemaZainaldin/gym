import { Component, inject, signal } from "@angular/core";
import {
  email,
  form,
  FormField,
  required,
} from "@angular/forms/signals";
import { MatButtonModule } from "@angular/material/button";
import { MatCard } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { Router } from "@angular/router";
import { AuthService } from "../../auth.service";
import { ToastService } from "@/app/core/toast/toast.service";

@Component({
  selector: "auth-forgot-password",
  templateUrl: "./forgot-password.html",
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
export default class AuthForgotPassword {
  // Dependencies
  private router = inject(Router);
  private toast = inject(ToastService)
  private authService = inject(AuthService);

  // State
  protected forgotPasswordFormModel = signal({
    email: "",
  });
  protected forgotPasswordForm = form(this.forgotPasswordFormModel, (form) => {
    required(form.email, { message: "You must enter an email address" });
    email(form.email, { message: "You must enter a valid email address" });
  });

  forgotPassword(event: Event) {
    event.preventDefault();
    this.authService.forgotPassword(this.forgotPasswordFormModel()).subscribe({
      next: (res) => {
        this.toast.showMessage(res?.message, 'success')
        this.router.navigateByUrl("/auth/reset-password");
      },

      error: (err) => {
        this.toast.showMessage(err?.error?.message, 'success')
      },
    });

  }


}
