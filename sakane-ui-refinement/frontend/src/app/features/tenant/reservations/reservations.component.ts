import { Component, inject, signal, ChangeDetectionStrategy, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../../core/api/reservation.service';
import { ReservationResponse } from '../../../core/api/models';
import { money, fmtRange, plural } from '../../../core/ui/format';
import { SkeletonRowsComponent } from '../../../shared/skeleton/skeleton-rows.component';
import { StateBlockComponent } from '../../../shared/state-block/state-block.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ModalService } from '../../../shared/modal/modal.service';
import { ImgAttrsDirective } from '../../../core/ui/img-attrs.directive';
import { environment } from '../../../../environments/environment';

type TabKey = 'ALL' | 'UPCOMING' | 'PAST';

@Component({
  selector: 'app-reservations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ImgAttrsDirective,
    SkeletonRowsComponent,
    StateBlockComponent,
    StatusBadgeComponent,
    IconComponent
  ],
  template: `
    <section class="container page-section">
      <div class="page-head">
        <div>
          <h1>My trips</h1>
          <p class="page-head__sub">Booking requests and stays. Cancelling is possible until 24 hours before check-in.</p>
        </div>
        <a class="btn btn--primary" routerLink="/">Find a place</a>
      </div>

      <div class="tabs" role="tablist" aria-label="Filter reservations">
        @for (t of tabs; track t.key) {
          <button
            class="tab"
            [class.is-active]="filter() === t.key"
            role="tab"
            [attr.aria-selected]="filter() === t.key"
            type="button"
            (click)="filter.set(t.key)"
          >
            {{ t.label }} <span class="tab__count">{{ tabCounts()[t.key] || 0 }}</span>
          </button>
        }
      </div>

      @if (error()) {
        <app-state-block kind="error" icon="warn" title="Could not load your trips" message="Your reservations could not be loaded." (retry)="load()" />
      } @else if (rows() !== null) {
        @if (!visibleRows().length) {
          <app-state-block
            icon="calendar"
            [title]="filter() === 'ALL' ? 'No trips yet' : 'Nothing here'"
            [message]="filter() === 'ALL'
              ? 'When you request a booking it will appear here with its status.'
              : 'No reservations match this tab.'"
          >
            @if (filter() === 'ALL') {
              <a class="btn btn--primary" routerLink="/">Find a place</a>
            }
          </app-state-block>
        } @else {
          <div class="res-list">
            @for (r of visibleRows(); track r.id) {
              <article class="res-card">
                <a class="res-card__media" [routerLink]="['/places', r.lieu!.id]" tabindex="-1" aria-hidden="true">
                  @if (r.lieu!.photos![0]) {
                    <img [appImg]="r.lieu!.photos![0]" [sizes]="'132px'" [widths]="[200, 400]" [alt]="r.lieu!.titre" />
                  }
                </a>
                <div class="res-card__content">
                  <p class="res-card__title">
                    <a [routerLink]="['/places', r.lieu!.id]">{{ r.lieu!.titre || '—' }}</a>
                  </p>
                  <p class="res-card__dates">
                    <app-icon name="calendar" />
                    {{ fmtRange(r.dateDebut, r.dateFin) }}
                    · {{ plural(r.totalNights, 'night') }}
                    @if (r.totalPrice != null) { · <strong>{{ money(r.totalPrice) }}</strong> }
                  </p>
                  @if (r.ownerMessage) {
                    <p class="res-card__note">Owner: "{{ r.ownerMessage }}"</p>
                  }
                  @if (r.cancellationReason) {
                    <p class="res-card__note text-muted">Reason: {{ r.cancellationReason }}</p>
                  }
                </div>
                <div class="res-card__side">
                  <app-status-badge [status]="r.statut" />
                  <div class="cluster">
                    @if (r.statut === 'TERMINEE' && r.lieu) {
                      <a class="btn btn--sm btn--secondary" [routerLink]="['/review-form']" [queryParams]="{ lieuId: r.lieu.id }">Write a review</a>
                    }
                    @if (isUpcoming(r)) {
                      <button class="btn btn--sm btn--danger-outline" type="button" (click)="cancelFlow(r)">Cancel</button>
                    }
                  </div>
                </div>
              </article>
            }
          </div>
        }
      } @else {
        <app-skeleton-rows [count]="3" cssClass="skeleton--row" />
      }
    </section>
  `
})
export class ReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private modal = inject(ModalService);

  readonly rows = signal<ReservationResponse[] | null>(null);
  readonly error = signal(false);
  readonly filter = signal<TabKey>('ALL');

  readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'UPCOMING', label: 'Pending & confirmed' },
    { key: 'PAST', label: 'Past and closed' }
  ];

  readonly tabCounts = computed(() => {
    const all = this.rows() || [];
    return {
      ALL: all.length,
      UPCOMING: all.filter(r => this.isUpcoming(r)).length,
      PAST: all.filter(r => !this.isUpcoming(r)).length
    };
  });

  readonly visibleRows = computed(() => {
    const all = this.rows() || [];
    const f = this.filter();
    if (f === 'ALL') return all;
    return f === 'UPCOMING' ? all.filter(r => this.isUpcoming(r)) : all.filter(r => !this.isUpcoming(r));
  });

  readonly money = money;
  readonly fmtRange = fmtRange;
  readonly plural = plural;

  ngOnInit(): void {
    this.load();
  }

  isUpcoming(r: ReservationResponse): boolean {
    return r.statut === 'EN_ATTENTE' || r.statut === 'CONFIRMEE';
  }

  load(): void {
    this.error.set(false);
    this.reservationService.my().subscribe({
      next: (rows) => this.rows.set(rows),
      error: () => this.error.set(true)
    });
  }

  cancelFlow(r: ReservationResponse): void {
    this.modal.confirm({
      title: 'Cancel this reservation?',
      message: `“${r.lieu?.titre || ''}” — ${fmtRange(r.dateDebut, r.dateFin)}. The owner will be notified. Cancelling is only possible more than 24 hours before check-in.`,
      confirmLabel: 'Cancel reservation',
      danger: true
    }).then(confirmed => {
      if (!confirmed) return;
      this.reservationService.cancel(r.id).subscribe({
        next: () => {
          // Update in place
          this.rows.update(all => {
            if (!all) return all;
            return all.map(x => x.id === r.id ? { ...x, statut: 'ANNULEE' as const } : x);
          });
        },
        error: (e) => {
          if (e.status === 500) {
            // 24h rule
            alert('This reservation can no longer be cancelled — check-in is less than 24 hours away.');
          }
        }
      });
    });
  }
}
