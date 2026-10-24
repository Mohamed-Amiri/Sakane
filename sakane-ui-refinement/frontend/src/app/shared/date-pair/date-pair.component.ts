import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

let sequence = 0;

/** Two-field check-in/check-out control (css: .date-pair) — used by the booking panel. */
@Component({
  selector: 'app-date-pair',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="date-pair" [class.date-pair--invalid]="invalid">
      <div class="date-pair__cell">
        <label [for]="idPrefix + '-start'">{{ startLabel }}</label>
        <input
          [id]="idPrefix + '-start'"
          type="date"
          [value]="startDate ?? ''"
          [min]="minStart ?? null"
          [disabled]="disabled"
          (change)="onStartChange($event)"
        />
      </div>
      <div class="date-pair__cell">
        <label [for]="idPrefix + '-end'">{{ endLabel }}</label>
        <input
          [id]="idPrefix + '-end'"
          type="date"
          [value]="endDate ?? ''"
          [min]="minEnd ?? null"
          [disabled]="disabled"
          (change)="onEndChange($event)"
        />
      </div>
    </div>
  `
})
export class DatePairComponent {
  @Input() idPrefix = `date-pair-${++sequence}`;
  @Input() startLabel = 'Check-in';
  @Input() endLabel = 'Check-out';
  @Input() startDate: string | null = null;
  @Input() endDate: string | null = null;
  @Input() minStart: string | null = null;
  @Input() minEnd: string | null = null;
  @Input() invalid = false;
  @Input() disabled = false;

  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();

  onStartChange(event: Event): void {
    this.startDateChange.emit((event.target as HTMLInputElement).value);
  }

  onEndChange(event: Event): void {
    this.endDateChange.emit((event.target as HTMLInputElement).value);
  }
}
