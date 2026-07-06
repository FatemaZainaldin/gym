import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ApiService } from '@/app/core/services/api-service.service';
import { AuthUser } from '@/app/core/services/auth.state';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private http = inject(ApiService);

  readonly API = `/users`;

  createUser(body: AuthUser): Observable<any> {
    return this.http
      .post(`${this.API}`, body);

  }

  getAllUsers(params?: any): Observable<any> {
    return this.http.get(`${this.API}`, { params });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.API}/${id}`);
  }

  updateUser(id: string, body: Partial<AuthUser>): Observable<any> {
    return this.http.patch(`${this.API}/${id}`, body);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }

    deactivateUser(id: string): Observable<any> {
    return this.http.patch(`${this.API}/${id}/suspend`,{});
  }

  resendUserCredentials(id: string): Observable<any> {
    return this.http.patch(`${this.API}/${id}/resend`,{});
  }

    activateUser(id: string): Observable<any> {
    return this.http.patch(`${this.API}/${id}/activate`,{});
  }


}