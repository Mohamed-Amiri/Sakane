import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LieuService } from '../lieu.service';
import { LightboxComponent } from '../../shared/lightbox/lightbox.component';
import flatpickr from 'flatpickr';
import type { Instance } from 'flatpickr/dist/types/instance';
import * as L from 'leaflet';
import { Lieu } from '../lieu.model';
import { FavoritesService } from '../../shared/favorites/favorites.service';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../shared/components/toast/toast.service';
import { MadCurrencyPipe } from '../../shared/pipes/mad-currency.pipe';
import { fadeInUpAnimation } from '../../shared/animations/fade.animation';

interface Review {
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date?: Date;
}

@Component({
  selector: 'app-lieu-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LightboxComponent, DatePipe, MadCurrencyPipe],
  animations: [fadeInUpAnimation],
  templateUrl: './lieu-detail.component.html',
  styleUrls: ['./lieu-detail.component.scss']
})
export class LieuDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('datePickerInput') datePickerInput!: ElementRef;
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('calendarContainer') calendarContainer!: ElementRef;
  @ViewChild('datePickerContainer') datePickerContainer!: ElementRef;
  @ViewChild('bookingSidebar') bookingSidebar!: ElementRef;

  // Sticky sidebar state
  isSidebarSticky = false;

  lieu: Lieu | undefined;
  isLightboxOpen = false;
  selectedImageIndex = 0;
  private map: L.Map | undefined;
  private flatpickrInstance: Instance | undefined;
  private bookingFlatpickr: Instance | undefined;

  // Booking properties
  startDate: Date | null = null;
  endDate: Date | null = null;
  totalNights = 0;
  totalPrice = 0;
  checkInFormatted: string = '';
  checkOutFormatted: string = '';
  isValidBooking: boolean = false;
  
  // Guests properties
  adults: number = 1;
  children: number = 0;
  infants: number = 0;
  isGuestsDropdownOpen: boolean = false;
  
  // Review properties
  averageRating = 0;
  displayedReviews: Review[] = [];
  showAllReviewsFlag: boolean = false;
  
  // UI state properties
  isSaved: boolean = false;
  showFullDescription: boolean = false;
  displayedAmenities: string[] = [];

  // Photo gallery properties
  selectedImage: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private lieuService: LieuService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const lieuId = +id;
      
      // First try to get from current data
      this.lieu = this.lieuService.getLieuById(lieuId);
      if (this.lieu) {
        this.initializeLieuData();
      }
      
      // Subscribe to updates in case data is still loading
      this.lieuService.getLieuById$(lieuId).subscribe(lieu => {
        if (lieu) {
          this.lieu = lieu;
          this.initializeLieuData();
        }
      });
    }
  }

  private initializeLieuData(): void {
    if (!this.lieu) return;
    
    // Initialize reviews (real data only)
    if (this.lieu.reviews?.length > 0) {
      this.calculateAverageRating();
      this.displayedReviews = this.lieu.reviews.slice(0, 6);
    }
    
    // Initialize photos
    if (this.lieu.photos.length > 0) {
      this.selectedImage = this.lieu.photos[0];
    }
    
    // Initialize amenities
    if (this.lieu.equipements?.length > 0) {
      this.displayedAmenities = this.lieu.equipements.slice(0, 8);
    }

    // If data arrived after the view was ready, ensure the map gets initialized
    setTimeout(() => this.initMap());
  }

  ngAfterViewInit(): void {
    this.setupDatePicker();
    this.initMap();
  }

  private initMap(): void {
    if (this.map || !this.lieu || !this.mapContainer) {
      return; // Map is already initialized or no lieu data
    }

    this.map = L.map(this.mapContainer.nativeElement).setView([this.lieu.lat, this.lieu.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ' OpenStreetMap contributors'
    }).addTo(this.map);

    // Create a custom marker icon
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `<div class="marker-content">
              <div class="marker-price">${Math.round(this.lieu.prix * 10.5)} DH</div>
            </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    L.marker([this.lieu.lat, this.lieu.lng], { icon: customIcon }).addTo(this.map)
      .bindPopup(`<strong>${this.lieu.titre}</strong><br>${this.lieu.ville}`)
      .openPopup();

    // The CSS grid sizes the container after init; recalc tiles once settled
    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  setupDatePicker(): void {
    // Setup the calendar in the main content
    if (this.calendarContainer) {
      this.flatpickrInstance = flatpickr(this.calendarContainer.nativeElement, {
        inline: true,
        mode: 'range',
        dateFormat: 'd/m/Y',
        minDate: 'today',
        showMonths: 2,
        onChange: (selectedDates: Date[]) => {
          if (selectedDates.length === 2) {
            this.startDate = selectedDates[0];
            this.endDate = selectedDates[1];
            this.updateFormattedDates();
            this.calculatePrice();
            this.isValidBooking = true;
          }
        }
      }) as Instance;
    }
    
    // Setup the date picker in the booking sidebar
    if (this.datePickerContainer) {
      this.bookingFlatpickr = flatpickr(this.datePickerContainer.nativeElement, {
        inline: true,
        mode: 'range',
        dateFormat: 'd/m/Y',
        minDate: 'today',
        onChange: (selectedDates: Date[]) => {
          if (selectedDates.length === 2) {
            this.startDate = selectedDates[0];
            this.endDate = selectedDates[1];
            this.updateFormattedDates();
            this.calculatePrice();
            this.isValidBooking = true;
          }
        }
      }) as Instance;
    }
  }
  
  updateFormattedDates(): void {
    if (this.startDate) {
      this.checkInFormatted = this.formatDate(this.startDate);
    } else {
      this.checkInFormatted = '';
    }
    
    if (this.endDate) {
      this.checkOutFormatted = this.formatDate(this.endDate);
    } else {
      this.checkOutFormatted = '';
    }
  }
  
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  openDatePicker(): void {
    if (this.bookingFlatpickr) {
      this.bookingFlatpickr.open();
    }
  }

  calculatePrice(): void {
    if (this.startDate && this.endDate && this.lieu) {
      const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
      this.totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.totalPrice = this.totalNights * this.lieu.prix;
    } else {
      this.totalNights = 0;
      this.totalPrice = 0;
    }
  }

  calculateAverageRating(): void {
    if (!this.lieu || !this.lieu.reviews || this.lieu.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }
    const total = this.lieu.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = total / this.lieu.reviews.length;
  }

  getStarArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  openLightbox(index: number): void {
    this.selectedImageIndex = index;
    this.isLightboxOpen = true;
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  // Branded fallback when a listing image URL fails to resolve
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.dataset['fallback']) { return; }
    img.dataset['fallback'] = '1';
    img.src =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
          <rect width='800' height='600' fill='#0A2540'/>
          <g fill='none' stroke='#C9A84C' stroke-width='2' opacity='0.6'
             transform='translate(400 270)'>
            <rect x='-34' y='-30' width='68' height='60' rx='6'/>
            <circle cx='-14' cy='-8' r='6'/>
            <polyline points='-34,28 -6,2 8,16 22,2 34,14'/>
          </g>
          <text x='400' y='350' fill='#FAF7F0' font-family='Georgia, serif'
             font-size='26' text-anchor='middle' opacity='0.85'>Photo bientôt disponible</text>
        </svg>`
      );
  }

  // Guest management methods
  toggleGuestsDropdown(): void {
    this.isGuestsDropdownOpen = !this.isGuestsDropdownOpen;
  }
  
  closeGuestsDropdown(): void {
    this.isGuestsDropdownOpen = false;
  }
  
  updateGuests(type: 'adults' | 'children' | 'infants', change: number): void {
    if (type === 'adults') {
      this.adults = Math.max(1, this.adults + change);
    } else if (type === 'children') {
      this.children = Math.max(0, this.children + change);
    } else if (type === 'infants') {
      this.infants = Math.max(0, this.infants + change);
    }
  }
  
  get totalGuests(): number {
    return this.adults + this.children;
  }
  
  // UI interaction methods
  toggleSave(): void {
    this.isSaved = !this.isSaved;
  }
  
  sharePlace(): void {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator.share({
        title: this.lieu?.titre,
        text: `Découvrez ${this.lieu?.titre} sur Sakane`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard?.writeText(window.location.href);
      this.toast.success('Lien copié dans le presse-papier !');
    }
  }
  
  toggleFullDescription(): void {
    this.showFullDescription = !this.showFullDescription;
  }
  
  showAllAmenities(): void {
    if (this.lieu?.equipements) {
      this.displayedAmenities = [...this.lieu.equipements];
    }
  }
  
  showAllReviews(): void {
    if (this.lieu?.reviews) {
      this.displayedReviews = [...this.lieu.reviews];
      this.showAllReviewsFlag = true;
    }
  }
  
  contactHost(): void {
    this.toast.info('Fonctionnalité de messagerie en cours de développement');
  }

  reportListing(): void {
    this.toast.success('Merci de nous signaler ce problème. Notre équipe va examiner cette annonce.');
  }
  
  // Helper methods
  getAmenityIcon(amenity: string): string {
    // Return SVG path data based on amenity type
    const amenityIcons: {[key: string]: string} = {
      'WiFi': 'M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01',
      'Cuisine': 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M12 8v8 M8 12h8',
      'Parking': 'M5 17h14v2H5v-2z M14 13h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1 M5 5h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5 M8 5v14',
      'Piscine': 'M2 12h20 M2 20h20 M2 4h20 M6 20c1.5 0 3-2 3-6 0-4-1.5-6-3-6s-3 2-3 6c0 4 1.5 6 3 6z M18 20c1.5 0 3-2 3-6 0-4-1.5-6-3-6s-3 2-3 6c0 4 1.5 6 3 6z',
      'Climatisation': 'M9.5 6.5v3a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2z M21 6.5v3a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2z M21 16.5v3a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2z M9.5 16.5v3a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2z',
      'TV': 'M2 7.5v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z M17 2l-5 5.5L7 2',
      'Lave-linge': 'M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 12v.01',
      'Sèche-linge': 'M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 12v.01',
      'Chauffage': 'M8 13.5V7a4 4 0 0 1 8 0v6.5 M8 13.5a4 4 0 0 0 8 0 M12 17v4 M8 17h8',
      'Salle de sport': 'M6 5v14 M18 5v14 M6 9h12 M6 15h12 M9 5v14 M15 5v14',
      'Jacuzzi': 'M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M7 16h10 M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z M3.5 11h17a2 2 0 0 1 0 4h-17a2 2 0 0 1 0-4z',
      'Barbecue': 'M8 18l-2 3 M12 18l-1 3 M16 18l1 3 M12 4a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z M18 12v6 M6 12v6',
      'Terrasse': 'M4 4h16v16H4z M4 12h16 M12 4v16',
      'Jardin': 'M12 22a9 9 0 0 0 9-9 9 9 0 0 0-9 9z M9 6c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 8 0z M19 6c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 8 0z',
      'Vue': 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'
    };
    
    // Default icon if amenity not found in the map
    return amenityIcons[amenity] || 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z M12 16v.01 M12 8v4';
  }
  
  goToReservation(): void {
    if (!this.lieu || !this.isValidBooking) {
      return;
    }
    
    const query: any = {
      adults: this.adults,
      children: this.children,
      infants: this.infants
    };
    
    if (this.startDate && this.endDate) {
      query.start = this.startDate.toISOString();
      query.end = this.endDate.toISOString();
    }
    
    this.router.navigate(['/reservation', this.lieu.id], { queryParams: query });
  }

  // Scroll listener for sticky sidebar
  @HostListener('window:scroll')
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isSidebarSticky = scrollTop > 400;
  }

  // Smooth scroll to section
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
