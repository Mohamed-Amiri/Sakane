import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Placeholder for the detail gallery when a place has no photos yet. */
@Component({
  selector: 'app-empty-gallery',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="detail-gallery__empty">
      <app-icon name="images" />
      <span>No photos yet</span>
    </figure>
  `
})
export class EmptyGalleryComponent {}
