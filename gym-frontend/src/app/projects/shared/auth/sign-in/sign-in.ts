import { Component, inject, signal } from "@angular/core";
import {
  email,
  form,
  FormField,
  required,
} from "@angular/forms/signals";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDivider } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { RouterLink } from "@angular/router";
import { ToastService } from "@/app/core/toast/toast.service";
import { AuthService } from "../auth.service";
import { AuthState } from "@/app/core/services/auth.state";

@Component({
  selector: "auth-sign-in",
  templateUrl: "./sign-in.html",
  imports: [
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    FormField,
    MatDivider,

  ],
})
export default class AuthSignIn {
  // Dependencies
  private toast = inject(ToastService);
  private authService = inject(AuthService);
   state = inject(AuthState);

  // State
  protected signInFormModel = signal({
    email: "",
    password: "",
  });
  protected signInForm = form(this.signInFormModel, (form) => {
    required(form.email, { message: "You must enter an email address" });
    email(form.email, { message: "You must enter a valid email address" });

    required(form.password, { message: "You must enter a password" });
  });

  signIn(event: Event) {
    event.preventDefault();

    this.authService.login({...this.signInFormModel(),subdomain : this.state?.tenant()?.subdomain ?? 'badan'}).subscribe({
      next: async (res) => {
        if (!res) return;

        // this.toast.showMessage(res?.message, 'success')
        await this.authService.redirectByRole();
      },

      error: (err) => {
        this.toast.showMessage(err?.error?.message, 'error')

      },
    });
  }
}
