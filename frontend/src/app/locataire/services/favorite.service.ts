import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Place } from './locataires.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/favorites`;

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<Place[]> {
    return this.http.get<Place[]>(this.apiUrl);
  }

  getFavoriteIds(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/ids`);
  }

  addFavorite(lieuId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${lieuId}`, {});
  }

  removeFavorite(lieuId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${lieuId}`);
  }
}
