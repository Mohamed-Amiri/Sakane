import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../auth/auth.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ReservationService } from '../services/reservation.service';
import { FavoriteService } from '../services/favorite.service';
import { Booking } from '../services/locataires.service';
import { MadCurrencyPipe } from '../../shared/pipes/mad-currency.pipe';
import { Title } from '@angular/platform-browser';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-tenant-dashboard',
  templateUrl: './tenant-dashboard.component.html',
  styleUrls: ['./tenant-dashboard.component.scss'],
  imports: [CommonModule, RouterModule, MadCurrencyPipe, ScrollRevealDirective],
  standalone: true
})
export class TenantDashboardComponent implements OnInit {
  user$!: Observable<User | null>;

  upcomingBooking: Booking | null = null;
  pendingCount = 0;
  confirmedCount = 0;
  favoritesCount = 0;
  loading = true;
  today = new Date();

  constructor(
    private authService: AuthService,
    private router: Router,
    private reservationService: ReservationService,
    private favoriteService: FavoriteService,
    private cdr: ChangeDetectorRef,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Tableau de bord Locataire — Sakane');
    this.user$ = this.authService.currentUser$;
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    const bookings$ = this.reservationService.getUserBookings().pipe(catchError(() => of([] as Booking[])));
    const favIds$ = this.favoriteService.getFavoriteIds().pipe(catchError(() => of([] as number[])));

    forkJoin({ bookings: bookings$, favIds: favIds$ }).subscribe({
      next: ({ bookings, favIds }) => {
        this.favoritesCount = favIds.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.pendingCount = bookings.filter(b => b.status === 'pending').length;
        this.confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

        // Upcoming = nearest future confirmed booking
        const upcoming = bookings
          .filter(b => b.status === 'confirmed' && new Date(b.startDate) >= today)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        this.upcomingBooking = upcoming[0] || null;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/locataire/search']);
  }
}