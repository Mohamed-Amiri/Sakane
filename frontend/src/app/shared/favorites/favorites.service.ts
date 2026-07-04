import { Injectable, signal, computed } from '@angular/core';
import { FavoriteService } from '../../locataire/services/favorite.service';
import { tap } from 'rxjs/operators';

/**
 * Shared in-memory favorites store backed by the real backend.
 * Used by LieuSearchComponent and PlaceDetailsComponent for fast in-memory reads,
 * while FavoriteService handles HTTP calls.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  // Local set for fast look-ups; kept in sync with backend on init
  private favoriteIds = signal<Set<number>>(new Set());

  constructor(private favoriteService: FavoriteService) {
    // Load real IDs on first use
    this.favoriteService.getFavoriteIds().subscribe({
      next: (ids) => this.favoriteIds.set(new Set(ids)),
      error: () => { /* not logged in – ignore */ }
    });
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds().has(id);
  }

  toggle(id: number): void {
    const isFav = this.isFavorite(id);
    // Optimistic UI update
    const updated = new Set(this.favoriteIds());
    if (isFav) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    this.favoriteIds.set(updated);

    const op$ = isFav
      ? this.favoriteService.removeFavorite(id)
      : this.favoriteService.addFavorite(id);

    op$.subscribe({
      error: () => {
        // Revert on error
        const reverted = new Set(this.favoriteIds());
        if (isFav) {
          reverted.add(id);
        } else {
          reverted.delete(id);
        }
        this.favoriteIds.set(reverted);
      }
    });
  }

  reload(): void {
    this.favoriteService.getFavoriteIds().subscribe({
      next: (ids) => this.favoriteIds.set(new Set(ids)),
      error: () => {}
    });
  }

  get count(): number {
    return this.favoriteIds().size;
  }
}
