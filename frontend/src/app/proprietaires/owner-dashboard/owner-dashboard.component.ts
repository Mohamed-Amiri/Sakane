import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProprietairesService, Property, BookingRequest } from '../services/proprietaires.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MadCurrencyPipe } from '../../shared/pipes/mad-currency.pipe';
import { AuthService, User } from '../../auth/auth.service';
import { Title } from '@angular/platform-browser';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

export interface OwnerDashboardStats {
  totalProperties: number;
  activeProperties: number;
  pendingRequests: number;
  approvedBookings: number;
  monthlyRevenue: number;
  occupancyRate: number;
  averageRating: number;
  unreadNotifications: number;
}

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MadCurrencyPipe,
    ScrollRevealDirective
  ],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.scss']
})
export class OwnerDashboardComponent implements OnInit {
  user$!: Observable<User | null>;
  properties: Property[] = [];
  recentBookingRequests: BookingRequest[] = [];
  stats: OwnerDashboardStats = {
    totalProperties: 0,
    activeProperties: 0,
    pendingRequests: 0,
    approvedBookings: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
    averageRating: 0,
    unreadNotifications: 0
  };
  loading = true;
  today = new Date();

  constructor(
    private proprietairesService: ProprietairesService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Tableau de bord Propriétaire — Sakane');
    this.user$ = this.authService.currentUser$;
    this.loadDashboardData();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  private loadDashboardData(): void {
    const dashboardStats$ = this.http.get<OwnerDashboardStats>(
      `${environment.apiUrl}/owner/dashboard`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(() => of(null)));

    const properties$ = this.proprietairesService.getOwnerProperties().pipe(catchError(() => of([] as Property[])));
    const requests$ = this.proprietairesService.getBookingRequests().pipe(catchError(() => of([] as BookingRequest[])));

    forkJoin({
      dashboardStats: dashboardStats$,
      properties: properties$,
      bookingRequests: requests$
    }).pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
    .subscribe({
      next: (data) => {
        this.properties = data.properties;
        this.recentBookingRequests = (data.bookingRequests || []).slice(0, 5);

        if (data.dashboardStats) {
          // Use real backend stats
          this.stats = data.dashboardStats;
        } else {
          // Fallback to frontend-calculated stats if backend fails
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const monthlyRevenue = (data.bookingRequests || [])
            .filter(r => {
              const bookingDate = new Date(r.checkIn);
              return r.status === 'approved' &&
                     bookingDate.getMonth() === currentMonth &&
                     bookingDate.getFullYear() === currentYear;
            })
            .reduce((total, booking) => total + (booking.totalPrice || 0), 0);

          this.stats = {
            totalProperties: this.properties.length,
            activeProperties: this.properties.filter(p => p.isActive).length,
            pendingRequests: (data.bookingRequests || []).filter(r => r.status === 'pending').length,
            approvedBookings: (data.bookingRequests || []).filter(r => r.status === 'approved').length,
            monthlyRevenue,
            occupancyRate: 0,
            averageRating: 0,
            unreadNotifications: 0
          };
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.properties = [];
        this.recentBookingRequests = [];
        this.cdr.detectChanges();
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'accent';
      case 'approved': return 'primary';
      case 'rejected': return 'warn';
      default: return '';
    }
  }

  getPropertyStatusChip(property: Property): { text: string, color: string } {
    if (!property.isActive) {
      return { text: 'Inactif', color: 'warn' };
    }
    return { text: 'Actif', color: 'primary' };
  }

  calculateNights(checkIn: Date, checkOut: Date): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  navigateToAddProperty(): void {
    this.router.navigate(['/proprietaires/add-property']);
  }
}