import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReservationResponse, UpdateUserRequest, UserResponse } from './models';

const BASE = `${environment.apiBaseUrl}/api/users`;

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly http: HttpClient) {}

  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${BASE}/me`);
  }

  /** Backend accepts a raw User entity and ignores any `role` sent (§13.15) — only send nom/email/password. */
  updateMe(payload: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${BASE}/me`, payload);
  }

  deleteMe(): Observable<void> {
    return this.http.delete<void>(`${BASE}/me`);
  }

  /** Duplicates ReservationService.my() for a tenant (§13.13) — prefer ReservationService.my() app-wide. */
  myReservations(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${BASE}/me/reservations`);
  }
}
