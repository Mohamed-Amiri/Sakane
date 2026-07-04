import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LocatairesService, Booking } from '../services/locataires.service';
import { ReservationService } from '../services/reservation.service';
import { ReviewService } from '../services/review.service';
import { CancelBookingDialogComponent } from '../../shared/cancel-booking-dialog/cancel-booking-dialog.component';
import { AddReviewDialogComponent } from '../../shared/add-review-dialog/add-review-dialog.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { MadCurrencyPipe } from '../../shared/pipes/mad-currency.pipe';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule, CancelBookingDialogComponent, AddReviewDialogComponent, EmptyStateComponent, SkeletonComponent, MadCurrencyPipe, ScrollRevealDirective],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;
  cancellingBookingId: number | null = null;
  confirmingBookingId: number | null = null;
  
  statusFilters = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Acceptées' },
    { value: 'cancelled', label: 'Refusées/Annulées' }
  ];
  
  selectedFilter = 'all';
  filteredBookings: Booking[] = [];

  // Modal State
  showCancelModal = false;
  bookingToCancel: Booking | null = null;

  showReviewModal = false;
  bookingToReview: Booking | null = null;

  constructor(
    private locatairesService: LocatairesService,
    private reservationService: ReservationService,
    private reviewService: ReviewService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private titleService: Title
  ) {}

  navigateToSearch(): void {
    this.router.navigate(['/locataire/search']);
  }

  ngOnInit(): void {
    this.loadBookings();
    // Set up automatic refresh every 30 seconds to catch status updates from proprietaires
    setInterval(() => {
      this.refreshBookings();
    }, 30000);
  }

  loadBookings(): void {
    this.loading = true;
    this.reservationService.getUserBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.loading = false;
      }
    });
  }

  refreshBookings(): void {
    this.reservationService.getUserBookings().subscribe({
      next: (bookings) => {
        const previousStatuses = this.bookings.map(b => ({ id: b.id, status: b.status }));
        
        this.bookings = bookings;
        this.applyFilter();
        
        const currentStatuses = this.bookings.map(b => ({ id: b.id, status: b.status }));
        const statusChanges = currentStatuses.filter(current => {
          const previous = previousStatuses.find(p => p.id === current.id);
          return previous && previous.status !== current.status;
        });
        
        if (statusChanges.length > 0) {
          const changeMessages = statusChanges.map(change => {
            const booking = this.bookings.find(b => b.id === change.id);
            return `Réservation ${booking?.place?.title || change.id}: ${this.getStatusLabel(change.status)}`;
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du rafraîchissement des réservations:', error);
      }
    });
  }

  applyFilter(): void {
    if (this.selectedFilter === 'all') {
      this.filteredBookings = this.bookings;
    } else {
      this.filteredBookings = this.bookings.filter(
        booking => booking.status === this.selectedFilter
      );
    }
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  // ---- Cancel Booking Logic ----
  cancelBooking(booking: Booking): void {
    this.bookingToCancel = booking;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.bookingToCancel = null;
  }

  onCancelConfirmed(): void {
    if (!this.bookingToCancel) return;
    
    const booking = this.bookingToCancel;
    this.showCancelModal = false;
    this.cancellingBookingId = booking.id;
    
    this.reservationService.cancelBooking(booking.id).subscribe({
      next: () => {
        booking.status = 'cancelled';
        
        setTimeout(() => {
          this.onFilterSelect('cancelled');
          this.cdr.detectChanges();
        }, 0);
        
        this.cancellingBookingId = null;
        this.bookingToCancel = null;
        this.toastService.success('Réservation annulée avec succès.');
      },
      error: (error) => {
        console.error('Erreur lors de l\'annulation:', error);
        this.cancellingBookingId = null;
        this.toastService.error('Erreur lors de l\'annulation de la réservation');
      }
    });
  }

  // ---- End Cancel Booking Logic ----


  isCancelling(bookingId: number): boolean {
    return this.cancellingBookingId === bookingId;
  }

  isConfirming(bookingId: number): boolean {
    return this.confirmingBookingId === bookingId;
  }

  confirmBooking(booking: Booking): void {
    this.confirmingBookingId = booking.id;
    
    this.reservationService.confirmBooking(booking.id).subscribe({
      next: () => {
        booking.status = 'confirmed';
        this.onFilterSelect('confirmed');
        this.confirmingBookingId = null;
        this.toastService.success('Réservation confirmée avec succès !');
      },
      error: (error) => {
        console.error('Erreur lors de la confirmation:', error);
        this.confirmingBookingId = null;
        this.toastService.error('Erreur lors de la confirmation de la réservation');
      }
    });
  }

  getCancellationMessage(booking: Booking): string {
    if (booking.status === 'cancelled') {
      return 'Réservation déjà annulée';
    }
    return 'Annulation non disponible';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return 'primary';
      case 'pending': return 'accent';
      case 'cancelled': return 'warn';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Acceptée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Refusée/Annulée';
      default: return status;
    }
  }

  canCancelBooking(booking: Booking): boolean {
    return booking.status !== 'cancelled';
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

  get confirmedBookingsCount(): number {
    return this.bookings.filter(b => b.status === 'confirmed').length;
  }

  get currentFilterLabel(): string {
    const filter = this.statusFilters.find(f => f.value === this.selectedFilter);
    return filter ? filter.label.toLowerCase() : '';
  }

  onFilterSelect(filterValue: string): void {
    this.selectedFilter = filterValue;
    this.onFilterChange();
  }

  getFilterIcon(filterValue: string): string {
    const icons: { [key: string]: string } = {
      'all':       'ph-list',
      'pending':   'ph-hourglass',
      'confirmed': 'ph-check-circle',
      'cancelled': 'ph-x-circle'
    };
    return icons[filterValue] || 'ph-list';
  }

  // ---- Add Review Logic ----
  canAddReview(booking: Booking): boolean {
    if (booking.status !== 'confirmed') return false;
    const endDate = new Date(booking.endDate);
    const now = new Date();
    return endDate < now;
  }

  addReview(booking: Booking): void {
    this.bookingToReview = booking;
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
      },
      error: (error) => {
        console.error('Erreur lors de la publication de l\'avis:', error);
        this.toastService.error('Erreur lors de la publication de l\'avis');
      }
    });
  }
  // ---- End Add Review Logic ----
}