import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AvisRequest, AvisResponse } from './models';

@Injectable({ providedIn: 'root' })
export class AvisService {
  constructor(private readonly http: HttpClient) {}

  forLieu(lieuId: number): Observable<AvisResponse[]> {
    return this.http.get<AvisResponse[]>(`${environment.apiBaseUrl}/api/lieux/${lieuId}/avis`);
  }

  my(): Observable<AvisResponse[]> {
    return this.http.get<AvisResponse[]>(`${environment.apiBaseUrl}/api/users/me/avis`);
  }

  create(lieuId: number, request: AvisRequest): Observable<AvisResponse> {
    return this.http.post<AvisResponse>(`${environment.apiBaseUrl}/api/lieux/${lieuId}/avis`, request);
  }

  update(avisId: number, request: AvisRequest): Observable<AvisResponse> {
    return this.http.put<AvisResponse>(`${environment.apiBaseUrl}/api/avis/${avisId}`, request);
  }

  delete(avisId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/avis/${avisId}`);
  }
}
