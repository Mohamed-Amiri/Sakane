import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReservationStatus } from '../../core/api/models';
import { RESERVATION_STATUS_META } from '../../core/ui/types';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="meta().cls">{{ meta().label }}</span>`
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: ReservationStatus | string;

  meta(): { label: string; cls: string } {
    return RESERVATION_STATUS_META[this.status] ?? { label: this.status, cls: 'badge--info' };
  }
}
