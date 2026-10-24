import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LieuResponse } from './models';

const BASE = `${environment.apiBaseUrl}/api/favorites`;

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<LieuResponse[]> {
    return this.http.get<LieuResponse[]>(BASE);
  }

  ids(): Observable<number[]> {
    return this.http.get<number[]>(`${BASE}/ids`);
  }

  add(lieuId: number): Observable<void> {
    return this.http.post<void>(`${BASE}/${lieuId}`, {});
  }

  remove(lieuId: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${lieuId}`);
  }
}
