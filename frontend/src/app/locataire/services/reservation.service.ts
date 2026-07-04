import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Booking, Place } from './locataires.service';
import { environment } from '../../../environments/environment';

/** Shape of a reservation as returned by the backend */
export interface BackendReservation {
  id: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
  totalPrice: number;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
  paymentMethod: string;
  ownerMessage?: string;
  message?: string;
  createdAt?: string;
  lieu?: {
    id: number;
    titre: string;
    description: string;
    prix: number;
    adresse: string;
    photos: string[];
    amenities: string[];
    averageRating: number;
    valide: boolean;
    type: string;
    city: string;
  };
  locataire?: { id: number; nom: string; email: string; };
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found in storage');
    }
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  // Method to clear reviews for testing (call from browser console)
  clearAllReviews(): void {
    localStorage.removeItem('user_reviews');
  }

  // Map backend -> frontend booking shape
  private mapReservationToBooking(r: BackendReservation): Booking {
    return {
      id: r.id,
      placeId: r.lieu?.id || 0,
      userId: r.locataire?.id || 0,
      startDate: new Date(r.dateDebut),
      endDate: new Date(r.dateFin),
      totalPrice: r.totalPrice || 0,
      status: this.mapBackendStatusToFrontend(r.statut),
      guests: r.guests || 1,
      guestInfo: {
        name: r.guestName || '',
        email: r.guestEmail || '',
        phone: r.guestPhone || '',
        specialRequests: r.specialRequests || ''
      },
      paymentMethod: r.paymentMethod || 'onsite',
      ownerMessage: r.ownerMessage || r.message || '',
      place: r.lieu ? {
        id: r.lieu.id,
        title: r.lieu.titre,
        description: r.lieu.description,
        price: r.lieu.prix,
        location: r.lieu.adresse,
        images: r.lieu.photos || [],
        amenities: r.lieu.amenities || [],
        rating: r.lieu.averageRating || 0,
        reviews: [],
        availability: r.lieu.valide,
        type: r.lieu.type || '',
        city: r.lieu.city || ''
      } : undefined
    };
  }

  // Map backend status to frontend status
  private mapBackendStatusToFrontend(backendStatus: string): Booking['status'] {
    const statusMap: { [key: string]: Booking['status'] } = {
      'EN_ATTENTE': 'pending',
      'CONFIRMEE': 'confirmed', 
      'REFUSEE': 'cancelled',
      'ANNULEE': 'cancelled'
    };
    return statusMap[backendStatus] || 'pending';
  }

  // Map frontend status to backend status
  private mapFrontendStatusToBackend(frontendStatus: Booking['status']): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'EN_ATTENTE',
      'confirmed': 'CONFIRMEE',
      'cancelled': 'ANNULEE'
    };
    return statusMap[frontendStatus] || 'EN_ATTENTE';
  }

  createBooking(bookingData: {
    place: Place;
    startDate: Date;
    endDate: Date;
    guests: number;
    totalPrice: number;
    guestInfo?: {
      name: string;
      email: string;
      phone?: string;
      specialRequests?: string;
    };
    paymentMethod?: string;
  }): Observable<Booking> {
    // Validate dates before sending to backend
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingData.startDate <= today) {
      throw new Error('La date d\'arrivée doit être postérieure à aujourd\'hui');
    }
    
    if (bookingData.startDate >= bookingData.endDate) {
      throw new Error('La date de départ doit être antérieure à la date de fin');
    }

    // Only send fields that backend expects in Sprint 2
    const payload = {
      placeId: bookingData.place.id,
      startDate: bookingData.startDate.toISOString().split('T')[0], // Send as YYYY-MM-DD format
      endDate: bookingData.endDate.toISOString().split('T')[0],     // Send as YYYY-MM-DD format
      guests: bookingData.guests,
      totalPrice: bookingData.totalPrice,
      guestName: bookingData.guestInfo?.name || '',
      guestEmail: bookingData.guestInfo?.email || '',
      guestPhone: bookingData.guestInfo?.phone || '',
      specialRequests: bookingData.guestInfo?.specialRequests || ''
    };
    
    return this.http.post<BackendReservation>(`${this.apiUrl}`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(r => this.mapReservationToBooking(r)),
      catchError(error => {
        console.error('Full error creating reservation:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        
        // Return a more descriptive error
        if (error.status === 401) {
          throw new Error('Vous devez être connecté pour faire une réservation');
        } else if (error.status === 400) {
          const errorMsg = error.error?.message || error.error || 'Données invalides';
          throw new Error(`Erreur de validation: ${errorMsg}`);
        } else if (error.status === 404) {
          throw new Error('Lieu non trouvé ou non disponible');
        } else if (error.status === 500) {
          const errorMsg = error.error?.message || 'Erreur serveur interne';
          throw new Error(`Erreur serveur: ${errorMsg}`);
        }
        throw error;
      })
    );
  }

  getUserBookings(): Observable<Booking[]> {
    return this.http.get<BackendReservation[]>(`${this.apiUrl}/my`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(list => list.map(r => this.mapReservationToBooking(r))),
      catchError(error => {
        console.error('Error fetching user bookings:', error);
        return of([]);
      })
    );
  }

  cancelBooking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${bookingId}/cancel`, {
      headers: this.getAuthHeaders()
    });
  }

  getBookingById(bookingId: number): Observable<Booking | undefined> {
    return this.getUserBookings().pipe(map(list => list.find(b => b.id === bookingId)));
  }

  updateBookingStatus(bookingId: number, status: 'pending' | 'confirmed' | 'cancelled'): Observable<Booking | undefined> {
    // Optional: implement when backend supports tenant status update
    return of(undefined);
  }

  confirmBooking(bookingId: number): Observable<void> {
    // For tenant, confirming may be N/A; keep placeholder
    return of(void 0);
  }
}