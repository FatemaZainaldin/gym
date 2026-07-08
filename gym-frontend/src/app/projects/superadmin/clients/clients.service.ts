import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ApiService } from '@/app/core/services/api-service.service';
import { Tenant } from './clients.model';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  private http = inject(ApiService);

  readonly API = `/superadmin/tenants`;

  createClient(body: Tenant): Observable<any> {
    return this.http
      .post(`${this.API}`, body);

  }

  getAllClients(params?: any): Observable<any> {
    return this.http.get(`${this.API}`, { params });
  }

  getClientById(id: string): Observable<any> {
    return this.http.get(`${this.API}/${id}`);
  }

  updateClient(id: string, body: Partial<Tenant>): Observable<any> {
    return this.http.patch(`${this.API}/${id}`, body);
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }

    deactivateClient(id: string): Observable<any> {
    return this.http.patch(`${this.API}/${id}/suspend`,{});
  }

  resendClientCredentials(id: string): Observable<any> {
    return this.http.patch(`${this.API}/${id}/resend`,{});
  }

    activateClient(id: string): Observable<any> {
    return this.http.patch(`${this.API}/${id}/activate`,{});
  }


}