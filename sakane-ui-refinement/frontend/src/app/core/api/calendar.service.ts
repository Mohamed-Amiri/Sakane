import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CalendarBlockRequest, CalendarEvent } from './models';

const BASE = `${environment.apiBaseUrl}/api/lieux`;

@Injectable({ providedIn: 'root' })
export class CalendarService {
  constructor(private readonly http: HttpClient) {}

  events(lieuId: number, startDate: string, endDate: string): Observable<CalendarEvent[]> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<CalendarEvent[]>(`${BASE}/properties/${lieuId}/calendar`, { params });
  }

  block(lieuId: number, request: CalendarBlockRequest): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(`${BASE}/properties/${lieuId}/calendar/block`, request);
  }

  deleteEvent(eventId: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/calendar/events/${eventId}`);
  }
}
