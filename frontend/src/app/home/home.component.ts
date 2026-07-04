import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlaceCardComponent, PlaceCardData } from '../shared/components/place-card/place-card.component';
import { LieuService } from '../lieux/lieu.service';
import { FooterComponent } from '../shared/footer/footer.component';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { AuthService } from '../auth/auth.service';

interface Category {
  name: string;
  slug: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PlaceCardComponent,
    FooterComponent,
    ScrollRevealDirective
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  Math = Math;

  heroContentStyle: any = {};
  isScrolled = false;
  mobileNavOpen = false;
  isLoading = true;

  // Categories
  categories: Category[] = [
    { name: 'Villas', slug: 'villa', icon: 'ph-house-line', count: 245 },
    { name: 'Bureaux', slug: 'bureau', icon: 'ph-buildings', count: 189 },
    { name: 'Événements', slug: 'evenement', icon: 'ph-confetti', count: 132 },
    { name: 'Studios', slug: 'studio', icon: 'ph-paint-brush', count: 97 },
    { name: 'Appartements', slug: 'appartement', icon: 'ph-building-apartment', count: 312 },
    { name: 'Riads', slug: 'riad', icon: 'ph-door', count: 45 },
    { name: 'Salles', slug: 'salle', icon: 'ph-warehouse', count: 78 },
  ];

  // Popular places
  popularPlaces: PlaceCardData[] = [];

  // Testimonials
  testimonials = [
    {
      quote: "Grâce à Sakane, j'ai trouvé le lieu parfait pour mon shooting photo en quelques clics. Service client au top !",
      author: 'Amina K.',
      city: 'Casablanca',
      initials: 'AK'
    },
    {
      quote: "La plateforme est intuitive et la variété des lieux proposés est incroyable. Je recommande vivement.",
      author: 'Youssef L.',
      city: 'Rabat',
      initials: 'YL'
    },
    {
      quote: "Louer mon bureau inoccupé sur Sakane a été une excellente source de revenus supplémentaires. Simple et efficace.",
      author: 'Fatima Z.',
      city: 'Marrakech',
      initials: 'FZ'
    }
  ];

  currentTransform = 0;
  private currentIndex = 0;
  private carouselInterval: any;

  // Stats animation
  espacesCount = 0;
  clientsCount = 0;
  noteCount = 0.0;
  
  private animateStats() {
    const duration = 1500;
    const steps = 30;
    const interval = duration / steps;
    
    let currentStep = 0;
    const statsTimer = setInterval(() => {
      currentStep++;
      this.espacesCount = Math.floor((10000 / steps) * currentStep);
      this.clientsCount = Math.floor((50000 / steps) * currentStep);
      this.noteCount = Number(((4.9 / steps) * currentStep).toFixed(1));
      
      if (currentStep >= steps) {
        this.espacesCount = 10000;
        this.clientsCount = 50000;
        this.noteCount = 4.9;
        clearInterval(statsTimer);
      }
    }, interval);
  }

  constructor(
    private lieuService: LieuService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.startCarousel();
    this.loadPopularPlaces();
    this.animateStats();
  }

  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  private loadPopularPlaces() {
    this.isLoading = true;
    this.lieuService.getLieux$().subscribe({
      next: (lieux) => {
        if (lieux && lieux.length > 0) {
          this.popularPlaces = lieux.slice(0, 3).map(lieu => ({
            id: lieu.id,
            name: lieu.titre,
            location: lieu.ville,
            price: lieu.prix,
            rating: lieu.note || 4.5,
            image: lieu.photo || 'assets/placeholder.jpg',
            capacity: lieu.capacity || 0,
            type: lieu.type,
            badges: [],
            isFavorite: false
          }));
        } else {
          this.setFallbackPlaces();
        }
        this.isLoading = false;
      },
      error: () => {
        this.setFallbackPlaces();
        this.isLoading = false;
      }
    });
  }

  private setFallbackPlaces() {
    this.popularPlaces = [
      {
        id: 991,
        name: "Villa L'Océan",
        location: 'Agadir, Maroc',
        price: 350,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
        capacity: 12,
        type: 'Villa',
        badges: ['Premium'],
        isFavorite: false
      },
      {
        id: 992,
        name: 'Loft Créatif',
        location: 'Casablanca, Maroc',
        price: 120,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
        capacity: 25,
        type: 'Studio',
        badges: ['Populaire'],
        isFavorite: false
      },
      {
        id: 993,
        name: 'Espace Riad',
        location: 'Marrakech, Maroc',
        price: 850,
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80',
        capacity: 150,
        type: 'Événement',
        badges: ['Exclusif'],
        isFavorite: false
      },
      {
        id: 994,
        name: 'Appartement Vue Mer',
        location: 'Tanger, Maroc',
        price: 95,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
        capacity: 4,
        type: 'Appartement',
        badges: ['Populaire'],
        isFavorite: false
      }
    ];
  }

  private startCarousel() {
    this.carouselInterval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
      this.currentTransform = -this.currentIndex * 100;
    }, 5000);
  }

  pauseCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  resumeCarousel() {
    this.startCarousel();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const scrollOffset = window.pageYOffset;
    this.isScrolled = scrollOffset > 50;
  }

  toggleMobileNav() {
    this.mobileNavOpen = !this.mobileNavOpen;
  }

  onSearch(searchData: {location: string, dates: string, guests: string}) {
  }

  toggleFavorite(id: number) {
    const place = this.popularPlaces.find(p => p.id === id);
    if (place) {
      place.isFavorite = !place.isFavorite;
    }
  }

  trackByPlaceId(index: number, place: PlaceCardData): number {
    return place.id;
  }

  nextTestimonial() {
    if (Math.abs(this.currentTransform) < (this.testimonials.length - 1) * 100) {
      this.currentTransform -= 100;
    }
  }

  previousTestimonial() {
    if (this.currentTransform < 0) {
      this.currentTransform += 100;
    }
  }

  goToTestimonial(index: number) {
    this.currentTransform = -index * 100;
  }
}
