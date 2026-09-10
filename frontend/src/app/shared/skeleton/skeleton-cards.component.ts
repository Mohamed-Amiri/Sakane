import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Ported from js/ui.js skeletonCards — grid of place-card-shaped placeholders. */
@Component({
  selector: 'app-skeleton-cards',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (i of counter(); track i) {
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton skeleton--media"></div>
        <div class="skeleton-lines">
          <div class="skeleton skeleton--line w-60"></div>
          <div class="skeleton skeleton--line"></div>
          <div class="skeleton skeleton--line w-40"></div>
        </div>
      </div>
    }
  `
})
export class SkeletonCardsComponent {
  @Input() count = 8;

  counter(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
