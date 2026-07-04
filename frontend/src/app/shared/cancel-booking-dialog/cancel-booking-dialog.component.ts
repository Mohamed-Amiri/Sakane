import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../locataire/services/locataires.service';
import { MadCurrencyPipe } from '../pipes/mad-currency.pipe';

@Component({
  selector: 'app-cancel-booking-dialog',
  standalone: true,
  imports: [CommonModule, MadCurrencyPipe],
  templateUrl: './cancel-booking-dialog.component.html',
  styleUrls: ['./cancel-booking-dialog.component.scss']
})
export class CancelBookingDialogComponent {
  @Input() booking!: Booking;
  @Output() confirmed = new EventEmitter<boolean>();
  @Output() cancelled = new EventEmitter<void>();

  onCancel(): void {
    this.cancelled.emit();
  }

  onConfirm(): void {
    this.confirmed.emit(true);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getDuration(): number {
    const start = new Date(this.booking.startDate);
    const end = new Date(this.booking.endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}