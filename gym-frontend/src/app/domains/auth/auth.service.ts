import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, tap, switchMap } from "rxjs";
import { environment } from "@/environments/environment";
import { AuthState, AuthUser } from "./auth.state";


interface LoginResponse {
  accessToken: string;
  accessExpires: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private state = inject(AuthState);

  readonly API = `${environment.apiUrl}/auth`;

  login(body: { email: string; password: string }): Observable<AuthUser> {
    return this.http
      .post<LoginResponse>(`${this.API}/login`, body, { withCredentials: true })
      .pipe(
        tap(({ accessToken, accessExpires }) =>
          this.state.setToken(accessToken, accessExpires)
        ),
        switchMap(() => this.loadMe()),  // fetch user + navigation in one shot
      );
  }

  loadMe(): Observable<AuthUser> {
    return this.http
      .get<AuthUser>(`${this.API}/me`, { withCredentials: true })
      .pipe(
        tap(user => {
          const sortedModules = [...user.modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          user = {
            ...user,
            modules: sortedModules
          }
          this.state.setUser(user);


        })
      );
  }

  register(body: any): Observable<any> {
    return this.http
      .post<any>(`${this.API}/signup`, body);
  }

  forgotPassword(body: { email: string }): Observable<any> {
    return this.http
      .post<any>(`${this.API}/forgot-password`, body);

  }
  resetPassword(body: { password: string }): Observable<any> {
    return this.http
      .post<any>(`${this.API}/reset-password`, { ...body, token: this.state.token() });

  }



  refresh(): Observable<void> {
    return this.http
      .post<LoginResponse>(`${this.API}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(({ accessToken, accessExpires }) =>
          this.state.setToken(accessToken, accessExpires)
        ),
        switchMap(() => this.loadMe()),
      ) as any;
  }

  logout() {
    this.http
      .post(`${this.API}/logout`, {}, { withCredentials: true })
      .subscribe();
    this.state.clear();
    this.router.navigate(['/auth/sign-in']);
  }

}