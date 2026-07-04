import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LocatairesService, Place, SearchFilters } from '../services/locataires.service';
import { PlaceCardComponent, PlaceCardData } from '../../shared/components/place-card/place-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { Title } from '@angular/platform-browser';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-tenant-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PlaceCardComponent, SkeletonComponent, EmptyStateComponent, ScrollRevealDirective],
  templateUrl: './tenant-search.component.html',
  styleUrls: ['./tenant-search.component.scss']
})
export class TenantSearchComponent implements OnInit {
  searchForm: FormGroup;
  places: Place[] = [];
  loading = false;
  quickSearchLocation = '';
  showFilters = false;
  viewMode: 'grid' | 'list' = 'grid';
  
  // Template binding properties
  searchTerm = '';
  isLoading = false;
  filteredPlaces: Place[] = [];
  priceMin: number | null = null;
  priceMax: number | null = null;
  minRating: number | null = null;
  selectedAmenities: string[] = [];
  availableAmenities = [
    { id: 'wifi', name: 'WiFi', icon: '📶' },
    { id: 'parking', name: 'Parking', icon: '🚗' },
    { id: 'pool', name: 'Piscine', icon: '🏊' },
    { id: 'ac', name: 'Climatisation', icon: '❄️' },
    { id: 'kitchen', name: 'Cuisine équipée', icon: '🍳' },
    { id: 'balcony', name: 'Balcon', icon: '🏡' },
    { id: 'garden', name: 'Jardin', icon: '🌿' },
    { id: 'gym', name: 'Salle de sport', icon: '💪' }
  ];
  sortBy: string | null = null;
  
  readonly moroccanCities: string[] = [
    'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir',
    'Tanger', 'Meknès', 'Oujda', 'Kenitra', 'Tetouan',
    'El Jadida', 'Essaouira', 'Ouarzazate', 'Chefchaouen'
  ];

  amenitiesList = [
    'WiFi',
    'Parking',
    'Piscine',
    'Climatisation',
    'Cuisine équipée',
    'Balcon',
    'Jardin',
    'Salle de sport'
  ];

  constructor(
    private fb: FormBuilder,
    private locatairesService: LocatairesService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private titleService: Title
  ) {
    this.searchForm = this.fb.group({
      location: [''],
      minPrice: [''],
      maxPrice: [''],
      amenities: [[]],
      rating: ['']
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Recherche — Sakane');
    // Load all available lieux from proprietaires
    this.loadAvailablePlaces();
    
    // Subscribe to form changes to auto-search
    this.searchForm.valueChanges.subscribe(() => {
      this.searchPlaces();
    });
    
    // Initialize filteredPlaces
    this.filteredPlaces = this.places;
  }

  loadAvailablePlaces(): void {
    this.loading = true;
    this.isLoading = true;
    this.locatairesService.getAllPlaces().subscribe({
      next: (places) => {
        // Filter to show only available properties for tenants
        this.places = places.filter(place => place.availability);
        this.filteredPlaces = this.places;
        
        this.loading = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('TenantSearchComponent: Error loading available places:', error);
        // Keep empty array on error
        this.places = [];
        this.filteredPlaces = [];
        this.loading = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  searchPlaces(): void {
    this.loading = true;
    this.isLoading = true;
    this.cdr.detectChanges();
    
    const filters: SearchFilters = {
      location: this.searchForm.get('location')?.value || this.quickSearchLocation || this.searchTerm || undefined,
      minPrice: this.searchForm.get('minPrice')?.value || this.priceMin || undefined,
      maxPrice: this.searchForm.get('maxPrice')?.value || this.priceMax || undefined,
      amenities: this.searchForm.get('amenities')?.value || this.selectedAmenities || [],
      rating: this.searchForm.get('rating')?.value || this.minRating || undefined
    };
    
    
    // Use search endpoint if filters are provided, otherwise get all places
    const searchObservable = Object.values(filters).some(value => value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : true))
      ? this.locatairesService.searchPlaces(filters)
      : this.locatairesService.getAllPlaces();
    
    searchObservable.subscribe({
      next: (allPlaces) => {
        
        // Filter to show only available properties for tenants
        let availablePlaces = allPlaces.filter(place => place.availability);
        
        // Apply additional local filtering if needed
        let filteredResults = [...availablePlaces];
        
        // Additional local filtering for properties that aren't handled by backend search
        if (this.searchTerm && !filters.location) {
          const searchTermLower = this.searchTerm.toLowerCase();
          filteredResults = filteredResults.filter(place => 
            place.title.toLowerCase().includes(searchTermLower) ||
            place.location.toLowerCase().includes(searchTermLower) ||
            place.description.toLowerCase().includes(searchTermLower)
          );
        }
        
        // Filter by price range if not handled by backend
        if (this.priceMin !== null && !filters.minPrice) {
          filteredResults = filteredResults.filter(place => place.price >= this.priceMin!);
        }
        if (this.priceMax !== null && !filters.maxPrice) {
          filteredResults = filteredResults.filter(place => place.price <= this.priceMax!);
        }
        
        // Filter by rating if not handled by backend
        if (this.minRating !== null && !filters.rating) {
          filteredResults = filteredResults.filter(place => place.rating >= this.minRating!);
        }
        
        this.places = availablePlaces; // Keep all available places for reference
        this.filteredPlaces = filteredResults; // Use filtered array for display
        this.loading = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('TenantSearchComponent: Error searching places:', error);
        // Fallback to current data if search fails
        this.loading = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onAmenityChange(amenity: string, checked: boolean): void {
    const amenities = this.searchForm.get('amenities')?.value || [];
    if (checked) {
      amenities.push(amenity);
    } else {
      const index = amenities.indexOf(amenity);
      if (index > -1) {
        amenities.splice(index, 1);
      }
    }
    this.searchForm.patchValue({ amenities });
  }

  viewPlaceDetails(placeId: number): void {
    this.router.navigate(['/locataire/place', placeId]);
  }

  resetFilters(): void {
    this.searchForm.reset();
    this.searchForm.patchValue({ amenities: [] });
    this.quickSearchLocation = '';
    this.searchTerm = '';
    this.priceMin = null;
    this.priceMax = null;
    this.minRating = null;
    this.selectedAmenities = [];
    this.sortBy = null;
    this.loadAvailablePlaces(); // Load available places again
  }

  getAmenityIcon(amenity: string): string {
    const icons: { [key: string]: string } = {
      'WiFi': '📶',
      'Parking': '🚗',
      'Piscine': '🏊',
      'Climatisation': '❄️',
      'Cuisine équipée': '🍳',
      'Balcon': '🏡',
      'Jardin': '🌿',
      'Salle de sport': '💪'
    };
    return icons[amenity] || '✨';
  }

  onRatingSelect(rating: number): void {
    // If the same rating is clicked again, clear the filter
    if (this.searchForm.get('rating')?.value == rating) {
      this.searchForm.patchValue({ rating: '' });
    } else {
      this.searchForm.patchValue({ rating: rating.toString() });
    }
  }

  ratingNumbers: number[] = [1, 2, 3, 4, 5];
  
  get totalProperties(): number {
    return this.filteredPlaces.length; // Show filtered results count for tenants
  }
  
  get availableProperties(): number {
    return this.places.length; // Show total available properties
  }
  
  createStarArray(rating: number): number[] {
    return new Array(rating).fill(0);
  }
  
  hasActiveFilters(): boolean {
    const formValue = this.searchForm.value;
    return !!(formValue.minPrice || formValue.maxPrice || formValue.rating || 
             (formValue.amenities && formValue.amenities.length > 0) || 
             this.quickSearchLocation || this.searchTerm || this.priceMin || 
             this.priceMax || this.minRating || this.selectedAmenities.length > 0);
  }
  
  getActiveFilterCount(): number {
    let count = 0;
    const formValue = this.searchForm.value;
    if (formValue.minPrice || this.priceMin) count++;
    if (formValue.maxPrice || this.priceMax) count++;
    if (formValue.rating || this.minRating) count++;
    if ((formValue.amenities && formValue.amenities.length > 0) || this.selectedAmenities.length > 0) {
      count += Math.max(formValue.amenities?.length || 0, this.selectedAmenities.length);
    }
    if (this.quickSearchLocation || this.searchTerm) count++;
    return count;
  }
  
  getActiveFiltersCount(): number {
    return this.getActiveFilterCount();
  }
  
  toggleView(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }
  
  toggleFavorite(placeId: number): void {
    // Implement favorite toggle logic
  }
  
  getAveragePrice(): number {
    if (this.filteredPlaces.length === 0) return 0;
    const total = this.filteredPlaces.reduce((sum, place) => sum + place.price, 0);
    return Math.round(total / this.filteredPlaces.length);
  }
  
  sortProperties(sortType?: string): void {
    if (sortType) {
      this.sortBy = this.sortBy === sortType ? null : sortType;
    }
    
    if (this.sortBy === 'price') {
      this.filteredPlaces.sort((a, b) => b.price - a.price);
    } else {
      // Default sorting or no sorting
      this.filteredPlaces = [...this.filteredPlaces];
    }
  }
  
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  toggleAmenity(amenityId: string): void {
    const index = this.selectedAmenities.indexOf(amenityId);
    if (index > -1) {
      this.selectedAmenities.splice(index, 1);
    } else {
      this.selectedAmenities.push(amenityId);
    }
    
    // Update form value
    this.searchForm.patchValue({ amenities: this.selectedAmenities });
    
    // Trigger search
    this.searchPlaces();
  }

  mapToPlaceCardData(place: Place): PlaceCardData {
    return {
      id: place.id,
      name: place.title,
      location: place.location,
      price: place.price,
      rating: place.rating,
      image: place.images && place.images.length > 0 ? place.images[0] : 'assets/images/hero-bg.png',
      capacity: (place as any).maxGuests || 0,
      type: (place as any).type || 'Logement',
      badges: place.rating >= 4.8 ? ['Populaire'] : [],
      isFavorite: false
    };
  }
}