import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent, IconName } from '../icon/icon.component';

/**
 * Ported from js/ui.js stateBlock/renderError — empty & error states with a
 * real retry (re-runs the loader, never `location.reload()`). Project extra
 * actions (e.g. "Clear all filters") via content projection.
 */
@Component({
  selector: 'app-state-block',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="state-block" [class.state-block--error]="kind === 'error'" [attr.role]="kind === 'error' ? 'alert' : 'status'">
      <div class="state-block__icon">
        <app-icon [name]="icon ?? (kind === 'error' ? 'warn' : 'search')" />
      </div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      @if (retry.observed) {
        <button class="btn btn--secondary" type="button" (click)="retry.emit()">{{ retryLabel }}</button>
      }
      <ng-content></ng-content>
    </div>
  `
})
export class StateBlockComponent {
  @Input() kind: 'error' | 'empty' = 'empty';
  @Input() icon: IconName | null = null;
  @Input({ required: true }) title = '';
  @Input({ required: true }) message = '';
  @Input() retryLabel = 'Try again';
  @Output() retry = new EventEmitter<void>();
}
