import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardService } from '../../../core/api/dashboard.service';
import { ReservationService } from '../../../core/api/reservation.service';
import { NotificationService } from '../../../core/api/notification.service';
import { AuthService } from '../../../core/auth/auth.service';
import { OwnerDashboardStats } from '../../../core/api/models/dashboard.models';
import { ReservationResponse } from '../../../core/api/models';
import { NotificationResponse } from '../../../core/api/models';
import { money, fmtRange, fmtDateTime, initials, plural } from '../../../core/ui/format';
import { IconComponent } from '../../../shared/icon/icon.component';
import { SkeletonRowsComponent } from '../../../shared/skeleton/skeleton-rows.component';
import { StateBlockComponent } from '../../../shared/state-block/state-block.component';
import { OwnerSubnavComponent } from '../../../shared/owner-subnav/owner-subnav.component';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    SkeletonRowsComponent,
    StateBlockComponent,
    OwnerSubnavComponent
  ],
  template: `
    <section class="container page-section">
      <app-owner-subnav />

      <div class="page-head">
        <div>
          <span class="kicker" id="dash-greeting">Dashboard</span>
          <h1>Your places at a glance</h1>
          <p class="page-head__sub">A live summary across everything you have published.</p>
        </div>
        <a class="btn btn--primary" routerLink="/owner/places/new">+ New place</a>
      </div>

      @if (statsError()) {
        <app-state-block
          kind="error"
          icon="warn"
          title="Could not load statistics"
          message="The dashboard summary could not be loaded."
          (retry)="load()"
        />
      } @else if (stats()) {
        <div class="stat-strip" id="stat-grid" aria-live="polite">
          <div class="stat stat--lead">
            <span class="stat__label">Revenue this month</span>
            <span class="stat__value">{{ money(stats()!.monthlyRevenue) }}</span>
            <span class="stat__sub">Confirmed stays starting this month</span>
          </div>
          <div class="stat" [class.stat--attention]="stats()!.pendingRequests > 0">
            <span class="stat__label">Pending requests</span>
            <span class="stat__value">{{ stats()!.pendingRequests }}</span>
            <span class="stat__sub">{{ stats()!.pendingRequests ? 'Waiting for your decision' : 'Nothing to review' }}</span>
          </div>
          <div class="stat">
            <span class="stat__label">Confirmed bookings</span>
            <span class="stat__value">{{ stats()!.approvedBookings }}</span>
            <span class="stat__sub">Across all your places</span>
          </div>
          <div class="stat">
            <span class="stat__label">Published places</span>
            <span class="stat__value">{{ stats()!.totalProperties }}</span>
            <span class="stat__sub">{{ stats()!.averageRating ? 'Average rating ' + stats()!.averageRating.toFixed(1) + ' ★' : 'No reviews yet' }}</span>
          </div>
        </div>
      } @else {
        <div class="stat-strip">
          <app-skeleton-rows [count]="1" cssClass="skeleton--block" />
        </div>
      }

      <div class="dash-columns">
        <section class="card" aria-labelledby="pending-h">
          <div class="dash-card__head">
            <h2 id="pending-h">Pending requests</h2>
            <a class="btn btn--ghost btn--sm" routerLink="/owner/inbox">Open inbox →</a>
          </div>
          <div class="card__list" id="pending-list">
            @if (pending()) {
              @if (pending()!.length) {
                @for (r of pending(); track r.id) {
                  <div class="notif notif--compact">
                    <span class="avatar" aria-hidden="true">{{ initials(r.guestName || r.locataire!.nom) }}</span>
                    <div class="notif__body">
                      <p class="notif__title notif__title--sm">
                        {{ r.guestName || r.locataire!.nom || 'Tenant' }}
                        <span class="text-muted">→</span>
                        {{ r.lieu!.titre || '' }}
                      </p>
                      <p class="notif__msg">
                        {{ fmtRange(r.dateDebut, r.dateFin) }} · {{ r.guests ? plural(r.guests, 'guest') : '–' }}
                        <strong>{{ money(r.totalPrice) }}</strong>
                      </p>
                    </div>
                    <div class="notif__actions">
                      <a class="btn btn--sm btn--primary" routerLink="/owner/reservations">Review</a>
                    </div>
                  </div>
                }
              } @else {
                <p class="dash-empty">No pending requests right now.</p>
              }
            } @else if (pendingError()) {
              <p class="dash-empty text-danger">Requests could not be loaded.</p>
            } @else {
              <app-skeleton-rows [count]="2" cssClass="skeleton--row" />
            }
          </div>
        </section>

        <section class="card" aria-labelledby="notif-h">
          <div class="dash-card__head">
            <h2 id="notif-h">Latest notifications</h2>
          </div>
          <div class="card__list" id="dash-notifs">
            @if (notifs()) {
              @if (notifs()!.length) {
                @for (n of notifs(); track n.id) {
                  <div class="notif notif--compact" [class.notif--unread]="!n.lu">
                    <div class="notif__body">
                      <p class="notif__title notif__title--sm">{{ n.title }}</p>
                      <span class="notif__time">{{ fmtDateTime(n.createdAt) }}</span>
                    </div>
                  </div>
                }
              } @else {
                <p class="dash-empty">No notifications.</p>
              }
            } @else {
              <app-skeleton-rows [count]="2" cssClass="skeleton--row" />
            }
          </div>
        </section>
      </div>
    </section>
  `
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private reservationService = inject(ReservationService);
  private notificationService = inject(NotificationService);
  private auth = inject(AuthService);

  readonly stats = signal<OwnerDashboardStats | null>(null);
  readonly statsError = signal(false);
  readonly pending = signal<ReservationResponse[] | null>(null);
  readonly pendingError = signal(false);
  readonly notifs = signal<NotificationResponse[] | null>(null);

  readonly greeting = computed(() => {
    const s = this.auth.session();
    if (!s) return '';
    const h = new Date().getHours();
    const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const first = s.nom.split(' ')[0];
    return `${part}, ${first}.`;
  });

  readonly money = money;
  readonly fmtRange = fmtRange;
  readonly fmtDateTime = fmtDateTime;
  readonly initials = initials;
  readonly plural = plural;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.statsError.set(false);
    this.pendingError.set(false);

    forkJoin({
      stats: this.dashboardService.stats().pipe(catchError(() => of(null))),
      reservations: this.reservationService.owner().pipe(catchError(() => of(null))),
      notifs: this.notificationService.list().pipe(catchError(() => of(null)))
    }).subscribe(({ stats, reservations, notifs }) => {
      if (stats) {
        this.stats.set(stats);
      } else {
        this.statsError.set(true);
      }

      if (reservations) {
        this.pending.set(reservations.filter(r => r.statut === 'EN_ATTENTE').slice(0, 4));
      } else {
        this.pendingError.set(true);
      }

      if (notifs) {
        this.notifs.set(notifs.slice(0, 4));
      } else {
        this.notifs.set([]);
      }
    });
  }
}
