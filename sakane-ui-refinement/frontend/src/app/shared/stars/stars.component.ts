import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Ported from js/ui.js starsHtml — 5-star row with an optional review count. */
@Component({
  selector: 'app-stars',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="stars" role="img" [attr.aria-label]="note + ' out of 5 stars'">
      @for (i of [1, 2, 3, 4, 5]; track i) {
        <span [class.star--off]="i > round()">
          <app-icon name="star" />
        </span>
      }
    </span>
    @if (count != null) {
      <span class="text-sm text-secondary">({{ count }})</span>
    }
  `
})
export class StarsComponent {
  @Input({ required: true }) note = 0;
  @Input() count: number | null = null;

  round(): number {
    return Math.round(this.note);
  }
}
