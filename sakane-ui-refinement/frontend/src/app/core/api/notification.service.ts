import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationResponse } from './models';

const BASE = `${environment.apiBaseUrl}/api/notifications`;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(BASE);
  }

  unreadCount(): Observable<number> {
    return this.http.get<number>(`${BASE}/unread/count`);
  }

  /** 404 here means "not your notification" — ignore quietly / refresh the list (§12). */
  markRead(id: number): Observable<void> {
    return this.http.put<void>(`${BASE}/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.put<void>(`${BASE}/read-all`, {});
  }
}
