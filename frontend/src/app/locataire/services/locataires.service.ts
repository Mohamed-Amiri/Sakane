import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ImageService } from '../../shared/services/image.service';

export interface Place {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  photos?: string[];
  amenities: string[];
  rating: number;
  reviews: Review[];
  availability: boolean;
  type?: string;
  city?: string;
  maxGuests?: number;
  propertyType?: string;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  placeId: number;
  bookingId?: number;
  rating: number;
  comment: string;
  date: Date;
}

export interface Booking {
  id: number;
  placeId: number;
  userId: number;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  place?: Place;
  guests?: number;
  guestInfo?: {
    name: string;
    email: string;
    phone?: string;
    specialRequests?: string;
  };
  paymentMethod?: string;
  ownerMessage?: string;
}

export interface SearchFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  rating?: number;
}

interface LieuResponse {
  id: number;
  titre: string;
  description: string;
  type: string;
  prix: number;
  adresse: string;
  valide: boolean;
  photos: string[];
  amenities?: string[];
  city?: string;
  owner?: {
    id: number;
    nom: string;
    email: string;
    role: string;
  };
  averageRating?: number;
  reviewCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocatairesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private imageService: ImageService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  private mapLieuResponseToPlace(lieu: LieuResponse): Place {
    return {
      id: lieu.id,
      title: lieu.titre,
      description: lieu.description,
      price: lieu.prix,
      location: lieu.adresse,
      images: this.imageService.getImageUrls(lieu.photos),
      amenities: lieu.amenities || [],
      rating: lieu.averageRating || 4.5,
      reviews: [],
      availability: lieu.valide === true,
      type: lieu.type,
      city: lieu.city
    };
  }

  private extractLieuxArray(response: any): LieuResponse[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (response && Array.isArray(response.content)) {
      return response.content;
    }

    return [];
  }

  private mapBackendStatusToFrontend(status: string): Booking['status'] {
    const mapping: Record<string, Booking['status']> = {
      EN_ATTENTE: 'pending',
      CONFIRMEE: 'confirmed',
      REFUSEE: 'cancelled',
      ANNULEE: 'cancelled'
    };
    return mapping[status] || 'pending';
  }

  private mapReservationToBooking(reservation: any): Booking {
    return {
      id: reservation.id,
      placeId: reservation.lieu?.id,
      userId: reservation.locataire?.id,
      startDate: new Date(reservation.dateDebut),
      endDate: new Date(reservation.dateFin),
      totalPrice: reservation.totalPrice || 0,
      status: this.mapBackendStatusToFrontend(reservation.statut),
      guests: reservation.guests || 1,
      guestInfo: {
        name: reservation.guestName || '',
        email: reservation.guestEmail || '',
        phone: reservation.guestPhone || '',
        specialRequests: reservation.specialRequests || ''
      },
      paymentMethod: reservation.paymentMethod || 'onsite',
      ownerMessage: reservation.ownerMessage || reservation.message || '',
      place: reservation.lieu
        ? {
            id: reservation.lieu.id,
            title: reservation.lieu.titre,
            description: reservation.lieu.description,
            price: reservation.lieu.prix,
            location: reservation.lieu.adresse,
            images: this.imageService.getImageUrls(reservation.lieu.photos || []),
            amenities: reservation.lieu.amenities || [],
            rating: reservation.lieu.averageRating || 4.5,
            reviews: [],
            availability: reservation.lieu.valide,
            type: reservation.lieu.type,
            city: reservation.lieu.city
          }
        : undefined
    };
  }

  searchPlaces(filters: SearchFilters): Observable<Place[]> {
    const params = new URLSearchParams();

    if (filters.location) params.append('city', filters.location);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.apiUrl}/lieux/search?${queryString}` : `${this.apiUrl}/lieux`;

    return this.http.get<any>(url).pipe(
      map(response => this.extractLieuxArray(response).map(lieu => this.mapLieuResponseToPlace(lieu))),
      catchError(error => {
        console.error('Error searching places:', error);
        return of([]);
      })
    );
  }

  getPlaceById(id: number): Observable<Place> {
    return this.http.get<LieuResponse>(`${this.apiUrl}/lieux/${id}`).pipe(
      map(lieu => this.mapLieuResponseToPlace(lieu))
    );
  }

  getAllPlaces(): Observable<Place[]> {
    return this.http.get<any>(`${this.apiUrl}/lieux`).pipe(
      map(response => this.extractLieuxArray(response).map(lieu => this.mapLieuResponseToPlace(lieu))),
      catchError(error => {
        console.error('Error fetching places:', error);
        return of([]);
      })
    );
  }

  getMyPlaces(): Observable<Place[]> {
    return this.http.get<any>(`${this.apiUrl}/lieux/my`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractLieuxArray(response).map(lieu => this.mapLieuResponseToPlace(lieu))),
      catchError(error => {
        console.error('Error fetching my places:', error);
        return of([]);
      })
    );
  }

  createBooking(booking: Partial<Booking>): Observable<Booking> {
    if (!booking.placeId || !booking.startDate || !booking.endDate) {
      return throwError(() => new Error('Missing booking data'));
    }

    const payload = {
      placeId: booking.placeId,
      startDate: new Date(booking.startDate).toISOString().split('T')[0],
      endDate: new Date(booking.endDate).toISOString().split('T')[0]
    };

    return this.http.post<any>(`${this.apiUrl}/reservations`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(reservation => this.mapReservationToBooking(reservation))
    );
  }

  getUserBookings(): Observable<Booking[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservations/my`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(list => (Array.isArray(list) ? list : []).map(reservation => this.mapReservationToBooking(reservation))),
      catchError(error => {
        console.error('Error fetching user bookings:', error);
        return of([]);
      })
    );
  }

  cancelBooking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reservations/${bookingId}/cancel`, {
      headers: this.getAuthHeaders()
    });
  }

  addReview(placeId: number, review: Partial<Review>): Observable<Review> {
    return throwError(() => new Error('Use ReviewService.addReview() instead'));
  }

  getPlaceReviews(placeId: number): Observable<Review[]> {
    return throwError(() => new Error('Use ReviewService.getReviewsForPlace() instead'));
  }
}
