import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BookedRange {
  start: string;
  end: string;
  reason: string;
}

export interface AvailabilityResponse {
  lieuId: number;
  unavailableDates: string[];
  bookedRanges: BookedRange[];
}

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAvailability(lieuId: number, startDate: string, endDate: string): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(`${this.apiUrl}/lieux/${lieuId}/availability`, {
      params: { startDate, endDate }
    });
  }
}
