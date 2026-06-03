import { Component, inject, signal } from "@angular/core";
import {
  disabled,
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
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../auth.service";

@Component({
  selector: "auth-sign-up",
  templateUrl: "./sign-up.html",
  imports: [
    MatCard,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    FormField,
  ],
})
export default class AuthSignUp {

  private authService = inject(AuthService)

  constructor() {
    this.signUpForm.role().disabled();
  }
  // Dependencies
  private router = inject(Router);
  disableField = signal(true);
  // State
  protected signUpFormModel = signal({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "customer"

  });
  protected signUpForm = form(this.signUpFormModel, (schemaPath) => {
    required(schemaPath.firstName, { message: "You must enter your name" });
    required(schemaPath.lastName, { message: "You must enter your company name" });
    required(schemaPath.email, { message: "You must enter an email address" });
    email(schemaPath.email, { message: "You must enter a valid email address" });
    required(schemaPath.password, { message: "You must enter a password" });
    required(schemaPath.role, { message: "You must select the role" });
    disabled(schemaPath.role);
  });


  signUp(event: Event) {
    event.preventDefault();
    this.authService.register(this.signUpFormModel()).subscribe({
      next: () => {
        this.router.navigateByUrl('/auth/sign-in')
      },

      error: () => {
        /* empty */
      },
    });
  }

}
