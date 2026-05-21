import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@/environments/environment';

export interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string };
  params?: HttpParams | { [param: string]: string };
  withCredentials?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  readonly base = environment.apiUrl;

  get<T>(path: string, options?: RequestOptions) {
    return this.http.get<T>(`${this.base}${path}`, options);
  }

  post<T>(path: string, body: any, options?: RequestOptions) {
    return this.http.post<T>(`${this.base}${path}`, body, options);
  }

  patch<T>(path: string, body: any, options?: RequestOptions) {
    return this.http.patch<T>(`${this.base}${path}`, body, options);
  }

  put<T>(path: string, body: any, options?: RequestOptions) {
    return this.http.put<T>(`${this.base}${path}`, body, options);
  }

  delete<T>(path: string, options?: RequestOptions) {
    return this.http.delete<T>(`${this.base}${path}`, options);
  }

  getSilent<T>(path: string) {
    return this.http.get<T>(`${this.base}${path}`, {
      headers: { 'X-Silent': 'true' }
    });
  }
}