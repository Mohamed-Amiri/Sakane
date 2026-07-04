import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Lieu, Review, Host } from './lieu.model';
import { ImageService } from '../shared/services/image.service';

@Injectable({
  providedIn: 'root'
})
export class LieuService {
  private apiUrl = `${environment.apiUrl}/lieux`;
  private lieuxSubject = new BehaviorSubject<Lieu[]>([]);
  public lieux$ = this.lieuxSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient, private imageService: ImageService) {
    this.loadValidatedLieux();
  }

  // Enhanced error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('LieuService error:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
          break;
        case 404:
          errorMessage = 'Aucun lieu trouvé';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        default:
          errorMessage = `Erreur HTTP ${error.status}: ${error.statusText}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Transform backend response to frontend Lieu model
  private transformBackendToLieu(backendLieu: any): Lieu {
    const lieu: Lieu = {
      id: backendLieu.id,
      titre: backendLieu.titre || '',
      ville: this.extractCityFromAddress(backendLieu.adresse || ''),
      prix: backendLieu.prix || 0,
      type: backendLieu.type || 'Appartement',
      description: backendLieu.description || '',
      photo: this.imageService.getFirstImageUrl(backendLieu.photos),
      photos: this.imageService.getImageUrls(backendLieu.photos),
      lat: this.getDefaultLatForCity(this.extractCityFromAddress(backendLieu.adresse || '')),
      lng: this.getDefaultLngForCity(this.extractCityFromAddress(backendLieu.adresse || '')),
      note: 4.5, // Default rating, can be updated when reviews system is implemented
      equipements: backendLieu.amenities || [],
      reviews: [], // Will be populated when review system is implemented
      host: this.createDefaultHost(backendLieu.owner),
      capacity: backendLieu.maxGuests || 2,
      bedrooms: backendLieu.bedrooms || 1,
      bathrooms: backendLieu.bathrooms || 1,
      locationDescription: backendLieu.adresse || ''
    };
    
    return lieu;
  }

  // Helper method to extract city from address
  private extractCityFromAddress(address: string): string {
    if (!address) return 'Ville';
    
    // Simple extraction logic - can be enhanced based on address format
    const parts = address.split(',');
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    return address.split(' ').pop() || 'Ville';
  }

  // Helper method to get default coordinates for major cities
  private getDefaultLatForCity(city: string): number {
    const cityCoords: { [key: string]: { lat: number, lng: number } } = {
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Nice': { lat: 43.7102, lng: 7.2620 },
      'Bordeaux': { lat: 44.8378, lng: -0.5792 },
      'Lyon': { lat: 45.7640, lng: 4.8357 },
      'Marseille': { lat: 43.2965, lng: 5.3698 },
      'Toulouse': { lat: 43.6047, lng: 1.4442 }
    };
    
    const normalizedCity = city.toLowerCase();
    for (const [key, coords] of Object.entries(cityCoords)) {
      if (normalizedCity.includes(key.toLowerCase())) {
        return coords.lat;
      }
    }
    return 46.2276; // Center of France as default
  }

  private getDefaultLngForCity(city: string): number {
    const cityCoords: { [key: string]: { lat: number, lng: number } } = {
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Nice': { lat: 43.7102, lng: 7.2620 },
      'Bordeaux': { lat: 44.8378, lng: -0.5792 },
      'Lyon': { lat: 45.7640, lng: 4.8357 },
      'Marseille': { lat: 43.2965, lng: 5.3698 },
      'Toulouse': { lat: 43.6047, lng: 1.4442 }
    };
    
    const normalizedCity = city.toLowerCase();
    for (const [key, coords] of Object.entries(cityCoords)) {
      if (normalizedCity.includes(key.toLowerCase())) {
        return coords.lng;
      }
    }
    return 2.2137; // Center of France as default
  }

  // Helper method to create default host info
  private createDefaultHost(owner: any): Host {
    if (!owner) {
      return {
        name: 'Hôte',
        avatar: 'https://i.pravatar.cc/150?u=default',
        isSuperHost: false,
        isIdentityVerified: false
      };
    }

    return {
      name: owner.nom || owner.name || 'Hôte',
      avatar: `https://i.pravatar.cc/150?u=${owner.email || 'default'}`,
      isSuperHost: false,
      isIdentityVerified: true,
      guestCount: 0,
      rating: '4.5',
      reviewCount: '0',
      memberSince: 'récemment',
      description: `Bienvenue chez ${owner.nom || 'nous'} ! N'hésitez pas à nous contacter pour toute question.`
    };
  }

  // Load validated lieux from backend
  private loadValidatedLieux(): void {
    
    this.http.get<any>(this.apiUrl, this.httpOptions).pipe(
      retry(2),
      map(response => {
        const backendLieux = response.content || response; // Support both Page and raw array
        if (!Array.isArray(backendLieux)) {
          console.warn('Expected array but received:', backendLieux);
          return [];
        }
        return backendLieux.map(lieu => this.transformBackendToLieu(lieu));
      }),
      catchError(error => {
        console.error('Error loading validated lieux:', error);
        return of([]);
      })
    ).subscribe({
      next: (lieux) => {
        this.lieuxSubject.next(lieux);
      },
      error: (error) => {
        console.error('Failed to load lieux:', error);
        this.lieuxSubject.next([]);
      }
    });
  }

  // Public methods
  getLieux(): Lieu[] {
    return this.lieuxSubject.value;
  }

  getLieux$(): Observable<Lieu[]> {
    return this.lieux$;
  }

  getLieuById(id: number): Lieu | undefined {
    return this.lieuxSubject.value.find(lieu => lieu.id === id);
  }

  getLieuById$(id: number): Observable<Lieu | undefined> {
    return this.lieux$.pipe(
      map(lieux => lieux.find(lieu => lieu.id === id))
    );
  }

  // Search and filter methods
  searchLieux(keyword: string): Observable<Lieu[]> {
    const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    return this.http.get<any>(`${this.apiUrl}/search${params}`, this.httpOptions).pipe(
      retry(1),
      map(response => {
        const backendLieux = response.content || response;
        return backendLieux.map((lieu: any) => this.transformBackendToLieu(lieu));
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getLieuxByType(type: string): Observable<Lieu[]> {
    return this.http.get<any>(`${this.apiUrl}/type/${type}`, this.httpOptions).pipe(
      retry(1),
      map(response => {
        const backendLieux = response.content || response;
        return backendLieux.map((lieu: any) => this.transformBackendToLieu(lieu));
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // Refresh data method
  refreshLieux(): void {
    this.loadValidatedLieux();
  }
}