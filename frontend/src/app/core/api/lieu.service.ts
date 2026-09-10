import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AvailabilityResponse, LieuRequest, LieuResponse, Page, PlaceStatsResponse } from './models';

export interface SearchLieuxParams {
  keyword?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  page?: number;
  size?: number;
}

const BASE = `${environment.apiBaseUrl}/api/lieux`;

@Injectable({ providedIn: 'root' })
export class LieuService {
  constructor(private readonly http: HttpClient) {}

  list(page = 0, size = 12): Observable<Page<LieuResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<LieuResponse>>(BASE, { params });
  }

  get(id: number): Observable<LieuResponse> {
    return this.http.get<LieuResponse>(`${BASE}/${id}`);
  }

  /** GET /api/lieux/search — keyword takes precedence over the other filters (§8). */
  search(query: SearchLieuxParams): Observable<Page<LieuResponse>> {
    let params = new HttpParams().set('page', query.page ?? 0).set('size', query.size ?? 12);
    if (query.keyword) params = params.set('keyword', query.keyword);
    if (query.type) params = params.set('type', query.type);
    if (query.minPrice != null) params = params.set('minPrice', query.minPrice);
    if (query.maxPrice != null) params = params.set('maxPrice', query.maxPrice);
    if (query.city) params = params.set('city', query.city);
    return this.http.get<Page<LieuResponse>>(`${BASE}/search`, { params });
  }

  /** Auth-only (§13.2) — anonymous visitors get 401. */
  getAvailability(lieuId: number, startDate: string, endDate: string): Observable<AvailabilityResponse> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<AvailabilityResponse>(`${BASE}/${lieuId}/availability`, { params });
  }

  /** Auth-only (§13.2). */
  getStats(lieuId: number): Observable<PlaceStatsResponse> {
    return this.http.get<PlaceStatsResponse>(`${BASE}/${lieuId}/stats`);
  }

  getMy(): Observable<LieuResponse[]> {
    return this.http.get<LieuResponse[]>(`${BASE}/my`);
  }

  create(request: LieuRequest): Observable<LieuResponse> {
    return this.http.post<LieuResponse>(BASE, request);
  }

  update(id: number, request: LieuRequest): Observable<LieuResponse> {
    return this.http.put<LieuResponse>(`${BASE}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }

  /** multipart field name is `photos` (§3 Photos) — max 10 files total, 10 MB each. */
  uploadPhotos(id: number, files: File[]): Observable<string[]> {
    const form = new FormData();
    files.forEach((file) => form.append('photos', file));
    return this.http.post<string[]>(`${BASE}/${id}/photos`, form);
  }

  deletePhoto(id: number, url: string): Observable<void> {
    const params = new HttpParams().set('url', url);
    return this.http.delete<void>(`${BASE}/${id}/photos`, { params });
  }

  reorderPhotos(id: number, orderedUrls: string[]): Observable<void> {
    return this.http.put<void>(`${BASE}/${id}/photos/order`, orderedUrls);
  }
}
