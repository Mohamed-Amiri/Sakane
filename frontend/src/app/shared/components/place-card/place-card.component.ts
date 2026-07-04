import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MadCurrencyPipe } from '../../pipes/mad-currency.pipe';

export interface PlaceCardData {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  capacity: number;
  type: string;
  badges?: string[];
  isFavorite?: boolean;
}

@Component({
  selector: 'app-place-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MadCurrencyPipe],
  template: `
    <div class="place-card" [routerLink]="['/lieux', place.id]">
      <div class="card-image">
        <img *ngIf="!imageError" [src]="place.image" [alt]="place.name" loading="lazy" (error)="onImageError($event)">
        <div class="fallback-image" *ngIf="imageError">
          <i class="ph ph-image"></i>
          <span>Photo à venir</span>
        </div>
        <div class="card-overlay">
          <button 
            class="favorite-btn" 
            [class.active]="place.isFavorite"
            (click)="onToggleFavorite($event)"
            [attr.aria-label]="place.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          
          <div class="card-badges">
            <span 
              class="badge" 
              [ngClass]="'badge--' + getBadgeType(badge)"
              *ngFor="let badge of place.badges">
              {{ badge }}
            </span>
            <span class="badge badge--rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {{ place.rating }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="card-content">
        <div class="card-header-stack">
          <h3 class="place-name">{{ place.name }}</h3>
          <div class="place-price-right">
            <div class="price-amount">{{ place.price | madCurrency }}<span class="price-period">/jour</span></div>
          </div>
        </div>
        
        <div class="place-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {{ place.location }}
        </div>
        
        <div class="place-features">
          <span class="feature" *ngIf="place.capacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {{ place.capacity }} personnes
          </span>
          <span class="feature">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            {{ place.type }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .place-card {
      background: #FAFAF8;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: 1px solid transparent;
      text-decoration: none;
      color: inherit;
      display: block;

      &:hover {
        transform: translateY(-3px);
        border: 1px solid #B8960C;
      }

      .card-image {
        position: relative;
        height: 220px;
        overflow: hidden;

        .fallback-image {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #F5EFE0 0%, #EDE4CE 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          color: rgba(13, 31, 60, 0.35);

          i { font-size: 40px; }
          span {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.75rem;
            font-weight: 500;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            180deg, 
            rgba(0,0,0,0.3) 0%, 
            transparent 50%, 
            rgba(0,0,0,0.1) 100%
          );
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1rem;

          .favorite-btn {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--color-text-muted, #6B7C93);
            z-index: 10;

            &:hover {
              background: rgba(255, 255, 255, 1);
              color: var(--color-error, #B83232);
              transform: scale(1.1);
            }

            &.active {
              background: var(--color-error, #B83232);
              color: white;

              svg {
                fill: currentColor;
              }
            }
          }

          .card-badges {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-end;

            .badge {
              padding: 0.25rem 0.75rem;
              border-radius: 20px;
              font-size: 0.75rem;
              font-weight: 600;
              backdrop-filter: blur(10px);
              display: flex;
              align-items: center;
              gap: 0.25rem;
              border: 1px solid rgba(255, 255, 255, 0.2);

              &--premium {
                background: var(--color-gold, #C9A84C);
                color: var(--color-navy, #0A2540);
              }

              &--exclusif, &--exclusive {
                background: var(--color-navy, #0A2540);
                color: var(--color-gold, #C9A84C);
              }

              &--tendance, &--trending {
                background: var(--color-error, #B83232);
                color: white;
              }

              &--populaire, &--popular {
                background: var(--color-navy, #0A2540);
                color: white;
              }

              &--rating {
                background: rgba(255, 255, 255, 0.95);
                color: #111827;

                svg {
                  color: #F59E0B;
                }
              }
            }
          }
        }
      }

      &:hover .card-image img {
        transform: scale(1.05);
      }

      .card-content {
        padding: 1.5rem;

        .card-header-stack {
          display: flex;
          flex-direction: column;
          margin-bottom: 0.75rem;

          .place-name {
            width: 100%;
            font-size: 1.25rem;
            font-weight: 600;
            color: #0D1F3C;
            margin: 0 0 0.5rem 0;
            font-family: 'Cormorant Garamond', serif;
          }

          .place-price-right {
            text-align: right;
            align-self: flex-end;

            .price-amount {
              font-size: 1.125rem;
              font-weight: 700;
              color: #0D1F3C;
            }

            .price-period {
              font-size: 0.8125rem;
              font-weight: 400;
              color: #6B7C93;
              margin-left: 2px;
            }
            
            .price-secondary {
              font-size: 0.75rem;
              color: #9AADC2;
              margin-top: 2px;
            }
          }
        }

        .place-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-muted, #6B7C93);
          font-size: 0.9rem;
          margin-bottom: 1rem;
          font-weight: 500;

          svg {
            flex-shrink: 0;
            color: var(--color-text-light, #9AADC2);
          }
        }

        .place-features {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;

          .feature {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
            color: var(--color-text-muted, #6B7C93);
            font-weight: 500;

            svg {
              flex-shrink: 0;
              color: var(--color-text-light, #9AADC2);
            }
          }
        }
      }
    }

    // Dark mode support
    :host-context(.dark) .place-card {
      background: #1E1E1E;
      border-color: rgba(255, 255, 255, 0.1);

      &:hover {
        border-color: rgba(201, 168, 76, 0.3);
      }

      .card-content {
        .place-name {
          color: white;
        }

        .place-price .price-amount {
          color: white;
        }
      }
    }

    // Responsive design
    @media (max-width: 768px) {
      .place-card {
        .card-image {
          height: 180px;
        }

        .card-content {
          padding: 1.25rem;

          .card-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;

            .place-price {
              text-align: left;
            }
          }

          .place-features {
            gap: 0.75rem;

            .feature {
              font-size: 0.8rem;
            }
          }
        }
      }
    }
  `]
})
export class PlaceCardComponent {
  @Input() place!: PlaceCardData;
  @Output() toggleFavorite = new EventEmitter<number>();
  
  imageError = false;

  onImageError(event: Event) {
    this.imageError = true;
  }

  onToggleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.toggleFavorite.emit(this.place.id);
  }

  getBadgeType(badge: string): string {
    const badgeMap: { [key: string]: string } = {
      'Premium': 'premium',
      'Exclusif': 'exclusif',
      'Exclusive': 'exclusive',
      'Tendance': 'tendance',
      'Trending': 'trending',
      'Populaire': 'populaire',
      'Popular': 'popular'
    };
    return badgeMap[badge] || 'default';
  }
}