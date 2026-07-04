import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LieuService } from '../lieu.service';
import { Lieu } from '../lieu.model';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { FavoritesService } from '../../shared/favorites/favorites.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceCardComponent, PlaceCardData } from '../../shared/components/place-card/place-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

// @ts-ignore markercluster plugin
import 'leaflet.markercluster';

@Component({
  selector: 'app-lieu-search',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PlaceCardComponent, SkeletonComponent, EmptyStateComponent],
  templateUrl: './lieu-search.component.html',
  styleUrls: ['./lieu-search.component.scss']
})
export class LieuSearchComponent implements OnInit, OnDestroy, AfterViewInit {
  locations: Lieu[] = [];
  filteredLocations: Lieu[] = [];
  displayedLocations: Lieu[] = [];
  isFiltersVisible = true;
  viewMode: 'grid' | 'map' = 'grid';
  previewLocation?: Lieu;
  activeCard?: number;

  filterForm!: FormGroup;
  searchText = '';
  maxPrice = 1000;
  allTypes: string[] = [];
  allAmenities: string[] = [];

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private clusterGroup: any;

  pageSize = 12;
  currentPage = 1;

  private updatingUrl = false;

  isLoading = true;
  isLoadingMore = false;
  skeletonArray = Array.from({length: this.pageSize});
  activePhoto: Record<number,number> = {};
  private carouselTimers: Record<number, any> = {};
  @ViewChild('sentinel', { static:false }) sentinel?: ElementRef<HTMLElement>;

  constructor(
    private lieuService: LieuService,
    private fb: FormBuilder,
    private favs: FavoritesService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize form FIRST — getLieux$() is a BehaviorSubject that emits
    // synchronously on subscribe, so applyFilters() would run before the form
    // exists if we subscribed first.
    this.filterForm = this.fb.group({
      maxPrice: [this.maxPrice],
      types: this.fb.group({}),
      minRating: [0],
      amenities: this.fb.group({})
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
      this.syncUrl();
    });

    // Subscribe to lieux data (may fire synchronously)
    this.lieuService.getLieux$().subscribe(lieux => {
      this.locations = lieux;
      this.filteredLocations = [...this.locations];
      this.extractFilterOptions();
      this.applyFilters();
    });

    // delay initial display to show skeleton
    setTimeout(() => {
      this.updateDisplayed();
      this.isLoading = false;
      this.cdr.markForCheck(); // prevent NG0100 ExpressionChangedAfterChecked
    }, 600);

    // init from URL after form created
    this.route.queryParams.subscribe(params => this.initFromParams(params));
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    
    // Clear all carousel timers
    Object.values(this.carouselTimers).forEach(timer => clearInterval(timer));
  }

  ngAfterViewInit() {
    if(this.sentinel){
      const obs = new IntersectionObserver(entries=>{
        if(entries[0].isIntersecting && !this.isLoadingMore && this.displayedLocations.length < this.filteredLocations.length){
          this.loadMore();
        }
      }, { root:null, threshold:0.1 });
      obs.observe(this.sentinel.nativeElement);
    }
  }

  private extractFilterOptions(): void {
    if (this.locations.length === 0) {
      this.maxPrice = 1000; // Default value
      this.allTypes = [];
      this.allAmenities = [];
      return;
    }

    const prices = this.locations.map(l => l.prix);
    this.maxPrice = Math.max(...prices, 1000); // Ensure minimum value

    const types = this.locations.map(l => l.type);
    this.allTypes = [...new Set(types)];

    const amenities = this.locations.flatMap(l => l.equipements ?? []);
    this.allAmenities = [...new Set(amenities)];

    // Rebuild form controls if the form exists
    if (this.filterForm) {
      this.buildCheckboxControls('types', this.allTypes);
      this.buildCheckboxControls('amenities', this.allAmenities);
      
      // Update max price in form if it has changed
      this.filterForm.get('maxPrice')?.setValue(this.maxPrice, { emitEvent: false });
    }
  }

  private buildCheckboxControls(groupName: 'types' | 'amenities', options: string[]): void {
    const group = this.filterForm.get(groupName) as FormGroup;
    options.forEach(option => {
      group.addControl(option, this.fb.control(false));
    });
  }

  applyFilters(): void {
    if (!this.filterForm) { return; } // guard against early calls
    const filters = this.filterForm.value;
    const selectedTypes = Object.keys(filters.types).filter(key => filters.types[key]);
    const selectedAmenities = Object.keys(filters.amenities).filter(key => filters.amenities[key]);
    const query = this.searchText.trim().toLowerCase();

    this.filteredLocations = this.locations.filter(loc => {
      const priceMatch = loc.prix <= filters.maxPrice;
      const ratingMatch = loc.note >= filters.minRating;
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(loc.type);
      const amenitiesMatch = selectedAmenities.every(amenity => loc.equipements?.includes(amenity));
      const searchMatch = !query ||
        loc.titre?.toLowerCase().includes(query) ||
        loc.ville?.toLowerCase().includes(query);

      return priceMatch && ratingMatch && typeMatch && amenitiesMatch && searchMatch;
    });

    this.currentPage = 1;
    this.updateDisplayed();

    if (this.viewMode === 'map' && this.map) {
      this.updateMarkers();
    }
  }

  resetFilters(): void {
    this.filterForm.reset({
      maxPrice: this.maxPrice,
      minRating: 0,
      types: {}, 
      amenities: {}
    });
    this.allTypes.forEach(type => this.filterForm.get('types')?.get(type)?.setValue(false, { emitEvent: false }));
    this.allAmenities.forEach(amenity => this.filterForm.get('amenities')?.get(amenity)?.setValue(false, { emitEvent: false }));
    this.applyFilters();
  }

  toggleFilters(): void {
    this.isFiltersVisible = !this.isFiltersVisible;
  }

  onSearch(text: string): void {
    this.searchText = text;
    this.applyFilters();
  }

  setViewMode(mode: 'grid' | 'map'): void {
    this.viewMode = mode;
    if (mode === 'map') {
      setTimeout(() => this.initMap(), 0);
    }
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/lieux', id]);
  }

  isFav(id: number): boolean {
    return this.favs.isFavorite(id);
  }

  toggleFav(id: number): void {
    this.favs.toggle(id);
  }

  // Image carousel methods
  nextPhoto(locationId: number, event?: Event): void {
    if (event) event.stopPropagation();
    
    const location = this.locations.find(l => l.id === locationId);
    if (!location) return;
    
    const currentPhotoIndex = this.activePhoto[locationId] || 0;
    const nextIndex = (currentPhotoIndex + 1) % location.photos.length;
    this.activePhoto = { ...this.activePhoto, [locationId]: nextIndex };
  }

  prevPhoto(locationId: number, event?: Event): void {
    if (event) event.stopPropagation();
    
    const location = this.locations.find(l => l.id === locationId);
    if (!location) return;
    
    const currentPhotoIndex = this.activePhoto[locationId] || 0;
    const prevIndex = (currentPhotoIndex - 1 + location.photos.length) % location.photos.length;
    this.activePhoto = { ...this.activePhoto, [locationId]: prevIndex };
  }

  // Auto-rotate photos
  startAutoRotate(locationId: number): void {
    // Clear existing timer if any
    if (this.carouselTimers[locationId]) {
      clearInterval(this.carouselTimers[locationId]);
    }
    
    // Start new timer
    this.carouselTimers[locationId] = setInterval(() => {
      this.nextPhoto(locationId);
    }, 5000); // Rotate every 5 seconds
  }

  stopAutoRotate(locationId: number): void {
    if (this.carouselTimers[locationId]) {
      clearInterval(this.carouselTimers[locationId]);
      delete this.carouselTimers[locationId];
    }
  }

  private initMap(): void {
    if (this.map) { return; }

    this.map = L.map('map').setView([31.7917, -7.0926], 6); // Center on Morocco

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(this.map);

    this.updateMarkers();
  }

  private updateMarkers(): void {
    if (this.clusterGroup) { this.clusterGroup.remove(); }
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    if (this.filteredLocations.length === 0) { return; }

    // @ts-ignore markercluster plugin
    this.clusterGroup = L.markerClusterGroup();

    this.filteredLocations.forEach(location => {
      if (location.lat && location.lng) {
        const marker = L.marker([location.lat, location.lng])
          .bindPopup(`
            <div class="map-popup">
              <h4>${location.titre}</h4>
              <p>${location.ville}</p>
              <p><strong>${Math.round(location.prix * 10.5)} DH</strong> / jour</p>
              <button onclick="window.location.href='/lieux/${location.id}'">Voir détails</button>
            </div>
          `);
        this.clusterGroup.addLayer(marker);
      }
    });

    this.map.addLayer(this.clusterGroup);
  }

  private updateDisplayed(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedLocations = this.filteredLocations.slice(start, end);
  }

  loadMore(): void {
    this.isLoadingMore = true;
    // Simulate API call delay
    setTimeout(() => {
      this.currentPage++;
      this.updateDisplayed();
      this.isLoadingMore = false;
    }, 500);
  }

  private syncUrl(): void {
    if (this.updatingUrl) return;
    
    const filters = this.filterForm.value;
    const queryParams: any = {};
    
    if (filters.maxPrice !== this.maxPrice) queryParams.maxPrice = filters.maxPrice;
    if (filters.minRating > 0) queryParams.minRating = filters.minRating;
    
    const selectedTypes = Object.keys(filters.types).filter(key => filters.types[key]);
    if (selectedTypes.length > 0) queryParams.types = selectedTypes.join(',');
    
    const selectedAmenities = Object.keys(filters.amenities).filter(key => filters.amenities[key]);
    if (selectedAmenities.length > 0) queryParams.amenities = selectedAmenities.join(',');
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  private initFromParams(params: any): void {
    this.updatingUrl = true;
    
    if (params.maxPrice) {
      this.filterForm.get('maxPrice')?.setValue(+params.maxPrice, { emitEvent: false });
    }
    
    if (params.minRating) {
      this.filterForm.get('minRating')?.setValue(+params.minRating, { emitEvent: false });
    }
    
    if (params.types) {
      const types = params.types.split(',');
      types.forEach((type: string) => {
        if (this.allTypes.includes(type)) {
          this.filterForm.get('types')?.get(type)?.setValue(true, { emitEvent: false });
        }
      });
    }
    
    if (params.amenities) {
      const amenities = params.amenities.split(',');
      amenities.forEach((amenity: string) => {
        if (this.allAmenities.includes(amenity)) {
          this.filterForm.get('amenities')?.get(amenity)?.setValue(true, { emitEvent: false });
        }
      });
    }
    
    this.updatingUrl = false;
  }

  // Method to get top features for display
  getTopFeatures(location: Lieu): string[] {
    const features = location.equipements || [];
    return features.slice(0, 3);
  }

  // Method to toggle type filter
  toggleTypeFilter(type: string): void {
    const control = this.filterForm.get('types')?.get(type);
    if (control) {
      control.setValue(!control.value);
    }
  }

  // Method to toggle amenity filter
  toggleAmenityFilter(amenity: string): void {
    const control = this.filterForm.get('amenities')?.get(amenity);
    if (control) {
      control.setValue(!control.value);
    }
  }

  mapToPlaceCardData(lieu: Lieu): PlaceCardData {
    return {
      id: lieu.id,
      name: lieu.titre,
      location: lieu.ville,
      price: lieu.prix,
      rating: lieu.note,
      image: lieu.photos && lieu.photos.length > 0 ? lieu.photos[0] : 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
      capacity: lieu.capacity || 0,
      type: lieu.type,
      badges: lieu.note >= 4.8 ? ['Populaire'] : [],
      isFavorite: this.isFav(lieu.id)
    };
  }
}