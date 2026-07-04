import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LocatairesService, Booking } from '../services/locataires.service';
import { ReservationService } from '../services/reservation.service';
import { ReviewService } from '../services/review.service';
import { CancelBookingDialogComponent } from '../../shared/cancel-booking-dialog/cancel-booking-dialog.component';
import { AddReviewDialogComponent } from '../../shared/add-review-dialog/add-review-dialog.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { MadCurrencyPipe } from '../../shared/pipes/mad-currency.pipe';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    CancelBookingDialogComponent, 
    AddReviewDialogComponent, 
    SkeletonComponent,
    MadCurrencyPipe
  ],
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.scss']
})
export class ReservationDetailComponent implements OnInit {
  booking: Booking | null = null;
  loading = true;
  cancelling = false;
  confirming = false;

  // Dialog / Modal States
  showCancelModal = false;
  bookingToCancel: Booking | null = null;

  showReviewModal = false;
  bookingToReview: Booking | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private reviewService: ReviewService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        this.loadBookingDetail(id);
      } else {
        this.router.navigate(['/locataire/reservations']);
      }
    });
  }

  loadBookingDetail(id: number): void {
    this.loading = true;
    this.reservationService.getBookingById(id).subscribe({
      next: (booking) => {
        if (booking) {
          this.booking = booking;
        } else {
          this.toastService.error('Réservation non trouvée');
          this.router.navigate(['/locataire/reservations']);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la réservation:', error);
        this.toastService.error('Erreur lors du chargement de la réservation');
        this.loading = false;
        this.router.navigate(['/locataire/reservations']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/locataire/reservations']);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Acceptée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Refusée/Annulée';
      default: return status;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getDuration(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Cancel Booking Logic
  canCancelBooking(booking: Booking): boolean {
    return booking.status === 'pending' || booking.status === 'confirmed';
  }

  cancelBooking(): void {
    if (!this.booking) return;
    this.bookingToCancel = this.booking;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.bookingToCancel = null;
  }

  onCancelConfirmed(): void {
    if (!this.bookingToCancel || !this.booking) return;
    
    this.showCancelModal = false;
    this.cancelling = true;
    
    this.reservationService.cancelBooking(this.booking.id).subscribe({
      next: () => {
        if (this.booking) {
          this.booking.status = 'cancelled';
        }
        this.cancelling = false;
        this.bookingToCancel = null;
        this.toastService.success('Réservation annulée avec succès.');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors de l\'annulation:', error);
        this.cancelling = false;
        this.toastService.error('Erreur lors de l\'annulation de la réservation');
      }
    });
  }

  // Review Dialog Logic
  canAddReview(booking: Booking): boolean {
    if (booking.status !== 'confirmed') return false;
    const endDate = new Date(booking.endDate);
    const now = new Date();
    return endDate < now;
  }

  addReview(): void {
    if (!this.booking) return;
    this.bookingToReview = this.booking;
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.bookingToReview = null;
  }

  onReviewSubmitted(reviewData: { rating: number; comment: string; placeId: number; bookingId: number }): void {
    this.showReviewModal = false;
    
    this.reviewService.addReview(reviewData).subscribe({
      next: (review) => {
        this.bookingToReview = null;
        this.toastService.success('Avis publié avec succès ! Merci pour votre retour.');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors de la publication de l\'avis:', error);
        this.toastService.error('Erreur lors de la publication de l\'avis');
      }
    });
  }
}
