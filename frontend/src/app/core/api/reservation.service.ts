import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReservationRequest, ReservationResponse, ReservationStatus } from './models';

const BASE = `${environment.apiBaseUrl}/api/reservations`;

@Injectable({ providedIn: 'root' })
export class ReservationService {
  constructor(private readonly http: HttpClient) {}

  /** Failures on this endpoint carry empty bodies except 409 (§13.6) — the errorInterceptor already normalises status/body. */
  create(request: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(BASE, request);
  }

  my(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${BASE}/my`);
  }

  owner(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${BASE}/owner`);
  }

  /** 500 on this endpoint means <24h before check-in (§13.5) — not a generic server error. */
  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}/cancel`);
  }

  updateStatus(id: number, status: ReservationStatus, message?: string): Observable<ReservationResponse> {
    return this.http.put<ReservationResponse>(`${BASE}/${id}/status`, { status, message });
  }
}
