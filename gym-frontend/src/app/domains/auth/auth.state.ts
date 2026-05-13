// src/app/core/auth/auth.state.ts
import { Injectable, computed, signal } from '@angular/core';

export interface AuthUser {
  id:         string;
  email:      string;
  firstName:  string;
  lastName:   string;
  role:       'admin' | 'trainer' | 'customer';
  avatar?:    string;
  modules: NavItem[];   // comes from GET /auth/me
}

export interface NavItem {
  id_key:   string;
  title:    string;
  icon?:    string;
  link?:    string;
  type:     string;
  children?: NavItem[];
}

@Injectable({ providedIn: 'root' })
export class AuthState {
  // Private writable signal — only this service can mutate it
  private readonly _user    = signal<AuthUser | null>(null);
  private readonly _token   = signal<string | null>(null);
  private readonly _expires = signal<number | null>(null);

  // Public read-only signals — inject anywhere in the app
  readonly user        = this._user.asReadonly();
  readonly token       = this._token.asReadonly();
  readonly isLoggedIn  = computed(() => !!this._user());
  readonly role        = computed(() => this._user()?.role ?? null);
  readonly navigation  = computed(() => this._user()?.modules ?? []);
  readonly tokenExpiry = computed(() => this._expires());

  setUser(user: AuthUser)    { this._user.set(user); }
  setToken(token: string, expires: number) {
    this._token.set(token);
    this._expires.set(expires);
  }
  clear() {
    this._user.set(null);
    this._token.set(null);
    this._expires.set(null);
  }
}