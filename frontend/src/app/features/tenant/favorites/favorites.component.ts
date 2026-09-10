import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../../../core/api/favorite.service';
import { LieuResponse } from '../../../core/api/models';
import { plural } from '../../../core/ui/format';
import { SkeletonRowsComponent } from '../../../shared/skeleton/skeleton-rows.component';
import { StateBlockComponent } from '../../../shared/state-block/state-block.component';
import { PlaceCardComponent } from '../../../shared/place-card/place-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    SkeletonRowsComponent,
    StateBlockComponent,
    PlaceCardComponent
  ],
  template: `
    <section class="container page-section">
      <div class="page-head">
        <div>
          <h1>Favorites</h1>
          <p class="page-head__sub">Places you've saved. Tap the heart again to remove one. <span id="fav-count" class="num">{{ count() }}</span></p>
        </div>
      </div>

      @if (error()) {
        <app-state-block kind="error" icon="warn" title="Could not load favorites" message="Your saved places could not be loaded." (retry)="load()" />
      } @else if (rows() !== null) {
        @if (!rows()!.length) {
          <app-state-block
            icon="heart"
            title="No favorites yet"
            message="Tap the heart on any place to keep it here for later."
          >
            <a class="btn btn--primary" routerLink="/">Browse places</a>
          </app-state-block>
        } @else {
          <div class="place-grid" id="fav-grid" aria-live="polite">
            @for (l of rows()!; track l.id) {
              <app-place-card [lieu]="l" [isFavorite]="true" (toggleFav)="onRemoveFav(l)" />
            }
          </div>
        }
      } @else {
        <app-skeleton-rows [count]="4" cssClass="skeleton--card" />
      }
    </section>
  `
})
export class FavoritesComponent implements OnInit {
  private favoriteService = inject(FavoriteService);

  readonly rows = signal<LieuResponse[] | null>(null);
  readonly error = signal(false);

  readonly count = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error.set(false);
    this.favoriteService.list().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.count.set(plural(rows.length, 'saved place'));
      },
      error: () => this.error.set(true)
    });
  }

  onRemoveFav(l: LieuResponse): void {
    this.favoriteService.remove(l.id).subscribe({
      next: () => {
        this.rows.update(all => {
          const left = (all || []).filter(x => x.id !== l.id);
          this.count.set(plural(left.length, 'saved place'));
          return left.length ? left : [];
        });
      },
      error: () => {}
    });
  }
}
