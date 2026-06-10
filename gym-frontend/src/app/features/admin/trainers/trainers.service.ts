import { ApiService } from '@/app/core/services/api-service.service';
import { inject, Injectable } from '@angular/core';
import { AddTrainerForm } from './trainers.model';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class TrainersService {

  private http = inject(ApiService);

  readonly API = `/trainers`;

  createTrainer(body: AddTrainerForm): Observable<any> {
    return this.http
      .post(`${this.API}`, body);

  }

  getAllTrainers(params?: any): Observable<any> {
    return this.http.get(`${this.API}`, { params });
  }

  getTrainerById(id: string): Observable<any> {
    return this.http.get(`${this.API}/${id}`);
  }

  updateTrainer(id: string, body: Partial<AddTrainerForm>): Observable<any> {
    return this.http.patch(`${this.API}/${id}`, body);
  }

  deleteTrainer(id: string): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }

}