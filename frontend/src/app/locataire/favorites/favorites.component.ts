import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlaceCardComponent, PlaceCardData } from '../../shared/components/place-card/place-card.component';
import { LocatairesService, Place } from '../services/locataires.service';
import { FavoriteService } from '../services/favorite.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { Title } from '@angular/platform-browser';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, PlaceCardComponent, ScrollRevealDirective],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: PlaceCardData[] = [];
  filteredFavorites: PlaceCardData[] = [];
  loading = true;
  activeFilter = 'Tous';
  
  filters = [
    { label: 'Tous', value: 'Tous' },
    { label: 'Villas', value: 'Villa' },
    { label: 'Appartements', value: 'Appartement' },
    { label: 'Bureaux', value: 'Bureau' },
    { label: 'Studios', value: 'Studio' }
  ];

  constructor(
    private favoriteService: FavoriteService,
    private toastService: ToastService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Mes Favoris — Sakane');
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.favoriteService.getFavorites().subscribe({
      next: (places: Place[]) => {
        this.favorites = places.map(p => ({
          id: p.id!,
          name: p.title,
          location: p.location,
          price: p.price,
          rating: p.rating || 0,
          image: p.photos && p.photos.length > 0 ? p.photos[0] : 'assets/images/placeholder.jpg',
          capacity: p.maxGuests || 4, 
          type: p.propertyType || 'Villa',
          isFavorite: true
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading favorites', error);
        this.loading = false;
        this.toastService.error('Erreur lors du chargement des favoris');
      }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeFilter === 'Tous') {
      this.filteredFavorites = [...this.favorites];
    } else {
      this.filteredFavorites = this.favorites.filter(
        place => place.type === this.activeFilter
      );
    }
  }

  toggleFavorite(placeId: number): void {
    const previousFavorites = [...this.favorites];
    
    // Optimistic UI update
    this.favorites = this.favorites.filter(p => p.id !== placeId);
    this.applyFilter();
    
    this.favoriteService.removeFavorite(placeId).subscribe({
      error: () => {
        this.favorites = previousFavorites;
        this.applyFilter();
        this.toastService.error('Erreur lors de la suppression du favori');
      }
    });
  }
}
