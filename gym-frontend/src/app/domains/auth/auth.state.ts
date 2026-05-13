import { computed, Injectable, signal } from '@angular/core';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface NavItem {
  id_key:       string;
  title:        string;
  icon?:        string;
  link?:        string;
  route?:       string;
  type:         'basic' | 'collapsable' | 'group' | 'divider';
  badge?:       string;
  section?:     string;
  sectionLabel?: string;
  disabled?:    boolean;
  expanded?:    boolean;
  children?:    NavItem[];
}

export interface AuthUser {
  id:         string;
  email:      string;
  firstName:  string;
  lastName:   string;
  role:       'admin' | 'trainer' | 'customer';
  avatar?:    string;
  modules: NavItem[];
}

// ── Storage Keys ───────────────────────────────────────────────────────────────

const KEYS = {
  USER:    'fitpro_user',
  TOKEN:   'fitpro_token',
  EXPIRES: 'fitpro_expires',
} as const;

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthState {

  // ── SSR guard ───────────────────────────────────────────────────────────────
  private get isBrowser(): boolean {
    return typeof window !== 'undefined'
        && typeof sessionStorage !== 'undefined';
  }

  // ── Private writable signals — seeded from sessionStorage on boot ───────────
  private readonly _user    = signal<AuthUser | null>(
    this.read<AuthUser>(KEYS.USER)
  );

  private readonly _token   = signal<string | null>(
    this.isBrowser ? sessionStorage.getItem(KEYS.TOKEN) : null
  );

  private readonly _expires = signal<number | null>(
    this.read<number>(KEYS.EXPIRES)
  );

  // ── Public read-only signals ────────────────────────────────────────────────

  /** The full authenticated user object (null if not logged in) */
  readonly user = this._user.asReadonly();

  /** Raw JWT access token string */
  readonly token = this._token.asReadonly();

  /** True when a user is loaded in memory */
  readonly isLoggedIn = computed(() => !!this._user());

  /** The user's role: 'admin' | 'trainer' | 'customer' | null */
  readonly role = computed(() => this._user()?.role ?? null);

  /** Navigation items for the current user's role */
  readonly navigation = computed(() => this._user()?.modules ?? []);

  /** Unix timestamp when the access token expires */
  readonly tokenExpiry = computed(() => this._expires());

  /** Full display name */
  readonly fullName = computed(() => {
    const u = this._user();
    if (!u) return '';
    return `${u.firstName} ${u.lastName}`.trim();
  });

  /** First name only — useful for greetings */
  readonly firstName = computed(() => this._user()?.firstName ?? '');

  /** Avatar URL — falls back to null */
  readonly avatar = computed(() => this._user()?.avatar ?? null);

  /**
   * True when the access token is expired or will expire
   * within the next 60 seconds (used by the JWT interceptor
   * to trigger a proactive refresh).
   */
  readonly tokenExpiredOrExpiring = computed(() => {
    const expires = this._expires();
    if (!expires) return true;
    const nowPlusSixty = Math.floor(Date.now() / 1000) + 60;
    return expires < nowPlusSixty;
  });

  // ── Setters ─────────────────────────────────────────────────────────────────

  /**
   * Called after a successful login or GET /auth/me response.
   * Writes to the signal AND persists to sessionStorage.
   */
  setUser(user: AuthUser): void {
    this._user.set(user);
    this.persist(KEYS.USER, user);
  }

  /**
   * Called after login or token refresh.
   * Stores the raw access token and its expiry timestamp.
   */
  setToken(token: string, expires: number): void {
    this._token.set(token);
    this._expires.set(expires);

    if (this.isBrowser) {
      sessionStorage.setItem(KEYS.TOKEN,   token);
      sessionStorage.setItem(KEYS.EXPIRES, String(expires));
    }
  }

  /**
   * Called on logout or when the refresh token is rejected.
   * Clears all signals and removes all sessionStorage entries.
   */
  clear(): void {
    this._user.set(null);
    this._token.set(null);
    this._expires.set(null);

    if (this.isBrowser) {
      sessionStorage.removeItem(KEYS.USER);
      sessionStorage.removeItem(KEYS.TOKEN);
      sessionStorage.removeItem(KEYS.EXPIRES);
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /** Read and JSON-parse a value from sessionStorage safely */
  private read<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  /** JSON-stringify and write a value to sessionStorage safely */
  private persist(key: string, value: unknown): void {
    if (!this.isBrowser) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // sessionStorage can throw if storage quota is exceeded
      console.warn(`[AuthState] Failed to persist key "${key}" to sessionStorage`);
    }
  }
}