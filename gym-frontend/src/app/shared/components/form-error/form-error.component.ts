import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

const DEFAULT_MESSAGES = (f: string): Record<string, (err: any) => string> => ({
  required:             ()  => `${f} is required.`,
  requiredTrue:         ()  => `${f} must be accepted.`,
  minlength:            (e) => `${f} must be at least ${e.requiredLength} characters.`,
  maxlength:            (e) => `${f} must not exceed ${e.requiredLength} characters.`,
  min:                  (e) => `${f} must be at least ${e.min}.`,
  max:                  (e) => `${f} must not exceed ${e.max}.`,
  email:                ()  => `${f} must be a valid email address.`,
  pattern:              ()  => `${f} format is invalid.`,
  nullValidator:        ()  => `${f} is invalid.`,
  invalidDate:          ()  => `${f} must be a valid date.`,
  dateTooEarly:         (e) => `${f} must be after ${e.min}.`,
  dateTooLate:          (e) => `${f} must be before ${e.max}.`,
  dateRange:            ()  => `${f} end date must be after start date.`,
  url:                  ()  => `${f} must be a valid URL.`,
  phone:                ()  => `${f} must be a valid phone number.`,
  numeric:              ()  => `${f} must contain numbers only.`,
  alpha:                ()  => `${f} must contain letters only.`,
  alphanumeric:         ()  => `${f} must contain letters and numbers only.`,
  noSpaces:             ()  => `${f} must not contain spaces.`,
  lowercase:            ()  => `${f} must be lowercase.`,
  uppercase:            ()  => `${f} must be uppercase.`,
  subdomain:            ()  => `${f} may only contain lowercase letters, numbers, and hyphens.`,
  slug:                 ()  => `${f} may only contain lowercase letters, numbers, and hyphens.`,
  hexColor:             ()  => `${f} must be a valid hex color (e.g. #ff0000).`,
  json:                 ()  => `${f} must be valid JSON.`,
  integer:              ()  => `${f} must be a whole number.`,
  positive:             ()  => `${f} must be a positive number.`,
  negative:             ()  => `${f} must be a negative number.`,
  nonZero:              ()  => `${f} must not be zero.`,
  decimal:              (e) => `${f} must have at most ${e.maxDecimals} decimal places.`,
  passwordMismatch:     ()  => `${f} does not match.`,
  passwordWeak:         ()  => `${f} is too weak.`,
  passwordStrength:     ()  => `${f} must contain uppercase, lowercase, number, and special character.`,
  passwordMinLength:    ()  => `${f} must be at least 8 characters.`,
  fileUpload:           (e) => e,
  fileRequired:         ()  => `${f} is required.`,
  fileType:             (e) => `${f} must be ${e.allowed} format.`,
  fileSize:             (e) => `${f} must not exceed ${e.maxMb}MB.`,
  fileCount:            (e) => `${f} must not exceed ${e.max} files.`,
  uniqueEmail:          ()  => `${f} is already registered.`,
  uniqueSubdomain:      ()  => `${f} is already taken.`,
  invalidCredentials:   ()  => `${f} is incorrect.`,
  tokenExpired:         ()  => `${f} has expired. Please request a new one.`,
  notFound:             ()  => `${f} was not found.`,
  selectionRequired:    ()  => `Please select a ${f}.`,
  invalidSelection:     ()  => `${f} is not a valid selection.`,
  minItems:             (e) => `${f} must have at least ${e.min} item${e.min !== 1 ? 's' : ''}.`,
  maxItems:             (e) => `${f} must not exceed ${e.max} item${e.max !== 1 ? 's' : ''}.`,
  trialExpired:         ()  => `${f} trial period has expired.`,
  subscriptionRequired: ()  => `An active subscription is required for ${f}.`,
  tenantLimit:          (e) => `${f} has reached the maximum of ${e.max}.`,
  invalidTimezone:      ()  => `${f} is not a valid timezone.`,
  invalidCountry:       ()  => `${f} is not a valid country code.`,
  invalidCurrency:      ()  => `${f} is not a valid currency.`,
});

@Component({
  selector: 'form-error',
  template: `
    @if (firstError(); as msg) {
      {{ msg }}
    }
  `,
})
export class ErrorComponent {
  control  = input<AbstractControl | null>(null);
  field    = input<string>('This field');
  messages = input<Record<string, (err: any) => string>>({});

  firstError(): string | null {
    const errors = this.control()?.errors;
    if (!errors) return null;
    const merged = { ...DEFAULT_MESSAGES(this.field()), ...this.messages() };
    const key    = Object.keys(errors)[0];
    const fn     = merged[key];
    return fn ? fn(errors[key]) : `${this.field()} is invalid.`;
  }
}