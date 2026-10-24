import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconComponent, IconName } from '../icon/icon.component';

/** Single pill in the place-detail `.fact-chips` row — project the label/value via content. */
@Component({
  selector: 'app-fact-chip',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="fact-chip">
      <app-icon [name]="icon" />
      <ng-content></ng-content>
    </span>
  `
})
export class FactChipComponent {
  @Input({ required: true }) icon!: IconName;
}
