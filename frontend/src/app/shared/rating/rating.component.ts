import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Compact rating chip for cards/lists (js/ui.js ratingHtml). */
@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (average == null) {
      <span class="text-sm text-muted">No reviews yet</span>
    } @else {
      <span class="rating">
        <app-icon name="star" />
        {{ average!.toFixed(1) }}
        @if (count) {
          <small>({{ count }})</small>
        }
      </span>
    }
  `
})
export class RatingComponent {
  @Input() average: number | null = null;
  @Input() count: number | null = null;
}
