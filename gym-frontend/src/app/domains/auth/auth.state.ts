import { computed, Injectable, signal } from '@angular/core';
import { StorageService } from '../services/storage.service';

// ── Types ──────────────────────────────────────────────────────────────────

export interface NavItem {
  id_key: string;
  isDefault?:boolean;
  order?:number;
  title: string;
  icon?: string;
  link?: string;
  route?: string;
  type: 'basic' | 'collapsable' | 'group' | 'divider';
  badge?: string;
  section?: string;
  sectionLabel?: string;
  disabled?: boolean;
  expanded?: boolean;
  children?: NavItem[];
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'trainer' | 'customer';
  avatar?: string;
  modules: NavItem[];
}

// ── Storage Keys ───────────────────────────────────────────────────────────

const KEYS = {
  USER: 'session_user',
  TOKEN: 'session_token',
  EXPIRES: 'session_expires',
} as const;

// ── State ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthState {

  // Private writable signals — all start null, restored in constructor
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _token = signal<string | null>(null);
  private readonly _expires = signal<number | null>(null);

  // ── Public read-only signals ─────────────────────────────────────────────
  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly role = computed(() => this._user()?.role ?? null);
  readonly navigation = computed(() => this._user()?.modules ?? []);
  readonly fullName = computed(() => {
    const u = this._user();
    if (!u) return '';
    return `${u.firstName} ${u.lastName}`.trim();
  });
  readonly firstName = computed(() => this._user()?.firstName ?? '');
  readonly avatar = computed(() => this._user()?.avatar ?? null);
  readonly tokenExpiry = computed(() => this._expires());
  readonly tokenExpiredOrExpiring = computed(() => {
    const expires = this._expires();
    if (!expires) return true;
    return expires < Math.floor(Date.now() / 1000) + 60;
  });

  // ── Constructor — restore from sessionStorage ────────────────────────────
  constructor(private storage: StorageService) {
  }

  async init(): Promise<void> {
    this.restore();
  }

  // ── Setters ──────────────────────────────────────────────────────────────

  setUser(user: AuthUser): void {
    /* eslint-disable no-debugger */
    this._user.set(user);
    this.storage.setItem(KEYS.USER, JSON.stringify(user));
  }

  setToken(token: string, expires: number): void {
    this._token.set(token);
    this._expires.set(expires);
    this.storage.setItem(KEYS.TOKEN, token);
    this.storage.setItem(KEYS.EXPIRES, String(expires));
  }

  clear(): void {
    this._user.set(null);
    this._token.set(null);
    this._expires.set(null);
    this.storage.removeItem(KEYS.USER);
    this.storage.removeItem(KEYS.TOKEN);
    this.storage.removeItem(KEYS.EXPIRES);
  }

  // ── Private ──────────────────────────────────────────────────────────────

  public restore(): void {
    try {
      const rawUser = this.storage.getItem(KEYS.USER);
      const rawToken = this.storage.getItem(KEYS.TOKEN);
      const rawExpires = this.storage.getItem(KEYS.EXPIRES);

      if (rawUser) this._user.set(JSON.parse(rawUser));
      if (rawToken) this._token.set(rawToken);
      if (rawExpires) this._expires.set(Number(rawExpires));

    } catch (e) {
      console.warn('[AuthState] Failed to restore from storage:', e);
      this.clear();
    }
  }
}