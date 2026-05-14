import { Component, inject, signal } from "@angular/core";
import {
  disabled,
  email,
  form,
  FormField,
  required,
  submit,
} from "@angular/forms/signals";
import { MatButtonModule } from "@angular/material/button";
import { MatCard } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { Router, RouterLink } from "@angular/router";

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
export default class AuthSignUp  {

  constructor() {
    this.signUpForm.role().disabled();
  }
  // Dependencies
  private router = inject(Router);
  disableField = signal(true);
  // State
  protected signUpFormModel = signal({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "customer"

  });
 protected signUpForm = form(this.signUpFormModel, (schemaPath) => {
  required(schemaPath.first_name, { message: "You must enter your name" });
  required(schemaPath.last_name, { message: "You must enter your company name" });
  required(schemaPath.email, { message: "You must enter an email address" });
  email(schemaPath.email, { message: "You must enter a valid email address" });
  required(schemaPath.password, { message: "You must enter a password" });
  required(schemaPath.role, { message: "You must select the role" });
  disabled(schemaPath.role);
});

  

  signUp(event: Event) {
    event.preventDefault();

    submit(this.signUpForm, async () => {
      // Navigate to a route, demo purposes only
      this.router.navigateByUrl("/auth/sign-in");
    });
  }

}
