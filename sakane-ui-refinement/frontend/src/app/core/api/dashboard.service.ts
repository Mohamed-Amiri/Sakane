import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OwnerDashboardStats } from './models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  stats(): Observable<OwnerDashboardStats> {
    return this.http.get<OwnerDashboardStats>(`${environment.apiBaseUrl}/api/owner/dashboard`);
  }
}
