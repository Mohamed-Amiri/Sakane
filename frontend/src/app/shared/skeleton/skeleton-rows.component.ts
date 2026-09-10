import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Ported from js/ui.js skeletonRows — used for list/detail loading states. */
@Component({
  selector: 'app-skeleton-rows',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (i of counter(); track i) {
      <div class="skeleton" [class]="cssClass" aria-hidden="true"></div>
    }
  `
})
export class SkeletonRowsComponent {
  @Input() count = 3;
  @Input() cssClass = 'skeleton--block';

  counter(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
