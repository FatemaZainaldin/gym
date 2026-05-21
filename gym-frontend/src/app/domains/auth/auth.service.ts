import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, tap, switchMap, map } from "rxjs";
import { ApiService } from "@/app/core/services/api-service.service";
import { AuthState, AuthUser, NavItem } from "./auth.state";

// ── API response wrapper ───────────────────────────────────────────────────
interface ApiResponse<T = void> {
  success: boolean;
  name: string;
  message: { en: string; ar: string };
  data?: T;
}

interface TokenData {
  accessToken: string;
  accessExpires: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(ApiService);
  private router = inject(Router);
  private state = inject(AuthState);

  readonly API = `/auth`;

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  login(body: { email: string; password: string }): Observable<ApiResponse<AuthUser>> {
    return this.http
      .post<ApiResponse<TokenData>>(`${this.API}/login`, body, { withCredentials: true })
      .pipe(
        tap(res => {
          const { accessToken, accessExpires } = res.data!;
          this.state.setToken(accessToken, accessExpires);
        }),
        switchMap(() => this.loadMe()),
      );
  }

  // ── LOAD ME ────────────────────────────────────────────────────────────────
  loadMe(): Observable<ApiResponse<AuthUser>> {
    return this.http
      .get<ApiResponse<AuthUser>>(`${this.API}/me`, { withCredentials: true })
      .pipe(
        tap((response) => {
          const modules: NavItem[] = [...(response?.data?.modules ?? [])].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );

          const data: any = response?.data;
          if (data) {
            this.state.setUser({ ...data, modules });

          }
        }),
      );
  }

  // ── REGISTER ───────────────────────────────────────────────────────────────
  register(body: any): Observable<ApiResponse<{ userId: string }>> {
    return this.http
      .post<ApiResponse<{ userId: string }>>(`${this.API}/signup`, body);
  }

  // ── FORGOT PASSWORD ────────────────────────────────────────────────────────
  forgotPassword(body: { email: string }): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(`${this.API}/forgot-password`, body);
  }

  // ── RESET PASSWORD ─────────────────────────────────────────────────────────
  resetPassword(body: { password: string }): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(`${this.API}/reset-password`, body);
  }

  // ── REFRESH ────────────────────────────────────────────────────────────────
  refresh(): Observable<void> {
    return this.http
      .post<ApiResponse<TokenData>>(`${this.API}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(res => {
          const { accessToken, accessExpires } = res.data!;
          this.state.setToken(accessToken, accessExpires);
        }),
        switchMap(() => this.loadMe()),
        map(() => void 0),
      );
  }

  // ── LOGOUT ─────────────────────────────────────────────────────────────────
  logout(): void {
    this.http
      .post<ApiResponse>(`${this.API}/logout`, {}, { withCredentials: true })
      .subscribe();
    this.state.clear();
    this.router.navigate(['/auth/sign-in']);
  }

  // ── REDIRECT BY ROLE ───────────────────────────────────────────────────────
  redirectByRole(): void {
    const user = this.state.user();
    if (!user) { this.router.navigate(['/auth/sign-in']); return; }

    // Find the module marked as isDefault
    const defaultModule = user.modules?.find((m: NavItem) => m.isDefault);

    if (defaultModule?.link) {
      this.router.navigate([defaultModule.link]);
      return;
    }

    // Fallback if no default module defined
    const fallback: Record<string, string> = {
      admin: '/admin/dashboard',
      trainer: '/trainer/dashboard',
      customer: '/customer/dashboard',
    };
    this.router.navigate([fallback[user.role] ?? '/auth/sign-in']);
  }
}