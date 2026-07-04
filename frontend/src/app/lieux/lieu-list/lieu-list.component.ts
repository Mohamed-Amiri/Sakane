import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LieuService } from '../lieu.service';
import { MapComponent } from '../../shared/map/map.component';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import { MadCurrencyPipe } from '../../shared/pipes/mad-currency.pipe';

interface Lieu {
  id: number;
  titre: string;
  ville: string;
  prix: number;
  type: string;
  photo: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-lieu-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MapComponent, SkeletonLoaderComponent, MadCurrencyPipe],
  templateUrl: './lieu-list.component.html',
  styleUrls: ['./lieu-list.component.scss']
})
export class LieuListComponent implements OnInit {
  allLieux: Lieu[] = [];
  filteredLieux: Lieu[] = [];
  isFilterSidebarOpen = false;
  viewMode: 'grid' | 'list' = 'grid';
  isLoading = true;
  skeletonItems = Array(6).fill(0);

  filters: {
    type: Record<string, boolean>;
    maxPrice: number;
  } = {
    type: { appartement: false, maison: false, villa: false },
    maxPrice: 5000
  };

  constructor(private lieuService: LieuService) { }

  ngOnInit(): void {
    this.loadLieux();
  }

  loadLieux(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.allLieux = [
        {
          id: 1,
          titre: 'Villa Spacieuse avec Piscine',
          ville: 'Nice',
          prix: 350,
          type: 'Villa',
          photo: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
          lat: 43.7102,
          lng: 7.2620
        },
        {
          id: 2,
          titre: 'Appartement Moderne Centre-Ville',
          ville: 'Paris',
          prix: 120,
          type: 'Appartement',
          photo: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
          lat: 48.8566,
          lng: 2.3522
        },
        {
          id: 3,
          titre: 'Maison de Campagne Charmante',
          ville: 'Bordeaux',
          prix: 210,
          type: 'Maison',
          photo: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
          lat: 44.8378,
          lng: -0.5792
        }
      ];
      this.applyFilters();
      this.isLoading = false;
    }, 1500);
  }

  toggleFilterSidebar() {
    this.isFilterSidebarOpen = !this.isFilterSidebarOpen;
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  applyFilters() {
    this.isLoading = true;
    setTimeout(() => {
      this.filteredLieux = this.allLieux.filter(lieu => {
        const selectedTypes = Object.keys(this.filters.type).filter(key => this.filters.type[key as keyof typeof this.filters.type]);
        const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(lieu.type.toLowerCase());
        const priceMatch = lieu.prix <= this.filters.maxPrice;
        return typeMatch && priceMatch;
      });
      this.isLoading = false;
    }, 500);
  }
}
