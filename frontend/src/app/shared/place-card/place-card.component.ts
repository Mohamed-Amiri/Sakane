import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LieuResponse } from '../../core/api/models';
import { ImgAttrsDirective } from '../../core/ui/img-attrs.directive';
import { money } from '../../core/ui/format';
import { prettyType } from '../../core/ui/types';
import { IconComponent } from '../icon/icon.component';
import { RatingComponent } from '../rating/rating.component';

/** Ported from js/ui.js placeCard — the whole card links to the place, the heart button is a stop-propagation overlay. */
@Component({
  selector: 'app-place-card',
  standalone: true,
  imports: [RouterLink, ImgAttrsDirective, IconComponent, RatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="place-card">
      <div class="place-card__media">
        <img [appImg]="lieu.photos![0] || ''" [alt]="lieu.titre" />
        @if (showFavorite) {
          <button
            class="fav-btn"
            type="button"
            [class.is-pop]="justFavorited"
            [attr.aria-pressed]="isFavorite ? 'true' : 'false'"
            [attr.aria-label]="isFavorite ? 'Remove from favorites' : 'Save to favorites'"
            (click)="onToggleFav($event)"
          >
            <app-icon [name]="isFavorite ? 'heart-fill' : 'heart'" />
          </button>
        }
      </div>
      <div class="place-card__body">
        <p class="place-card__kicker">{{ prettyType(lieu.type) }}</p>
        <h3 class="place-card__title">
          <a [routerLink]="['/places', lieu.id]">{{ lieu.titre }}</a>
        </h3>
        <p class="place-card__meta">
          <app-icon name="pin" />
          <span>{{ where() }}</span>
        </p>
        <div class="place-card__foot">
          <span class="price">{{ money(lieu.prix) }} <span>/ night</span></span>
          <app-rating [average]="lieu.averageRating" [count]="lieu.reviewCount" />
        </div>
      </div>
    </article>
  `
})
export class PlaceCardComponent implements OnChanges {
  @Input({ required: true }) lieu!: LieuResponse;
  @Input() isFavorite = false;
  @Input() showFavorite = true;
  @Output() toggleFav = new EventEmitter<void>();

  readonly money = money;
  readonly prettyType = prettyType;
  justFavorited = false;

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['isFavorite'];
    if (change && !change.isFirstChange() && change.currentValue === true && change.previousValue === false) {
      this.justFavorited = true;
      setTimeout(() => (this.justFavorited = false), 400);
    }
  }

  where(): string {
    return [this.lieu.city || this.lieu.adresse, this.lieu.neighborhood].filter(Boolean).join(' · ');
  }

  onToggleFav(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleFav.emit();
  }
}
