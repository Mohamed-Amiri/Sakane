import { Component, inject, signal, ChangeDetectionStrategy, OnInit, computed } from '@angular/core';
import { ReservationService } from '../../../core/api/reservation.service';
import { ReservationResponse, ReservationStatus } from '../../../core/api/models';
import { money, fmtRange, initials } from '../../../core/ui/format';
import { SkeletonRowsComponent } from '../../../shared/skeleton/skeleton-rows.component';
import { StateBlockComponent } from '../../../shared/state-block/state-block.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { OwnerSubnavComponent } from '../../../shared/owner-subnav/owner-subnav.component';
import { ModalService } from '../../../shared/modal/modal.service';
import { NoteModalComponent } from '../../../shared/modal/note-modal.component';
import { ActionModalComponent } from '../../../shared/modal/action-modal.component';
import { IconComponent } from '../../../shared/icon/icon.component';

type TabKey = 'ALL' | 'EN_ATTENTE' | 'CONFIRMEE' | 'TERMINEE';

@Component({
  selector: 'app-owner-inbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconComponent,
    SkeletonRowsComponent,
    StateBlockComponent,
    StatusBadgeComponent,
    OwnerSubnavComponent
  ],
  template: `
    <section class="container page-section">
      <div class="page-head">
        <div>
          <h1>Reservation requests</h1>
          <p class="page-head__sub">Pending requests can be confirmed or refused. Confirmed stays can be completed or cancelled. Refused, cancelled and completed are final.</p>
        </div>
      </div>
      <app-owner-subnav />

      <div class="tabs" role="tablist" aria-label="Filter by status">
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
        <app-state-block kind="error" icon="warn" title="Could not load requests" message="Reservation requests could not be loaded." (retry)="load()" />
      } @else if (rows() !== null) {
        @if (!visibleRows().length) {
          <app-state-block
            icon="inbox"
            [title]="filter() === 'EN_ATTENTE' ? 'Inbox zero' : 'Nothing here'"
            [message]="filter() === 'EN_ATTENTE' ? 'No pending requests — new booking requests land here.' : 'No reservations with this status.'"
          />
        } @else {
          <div class="table-wrap">
            <table class="data-table data-table--stack">
              <thead>
                <tr>
                  <th scope="col">Tenant</th>
                  <th scope="col">Place</th>
                  <th scope="col">Dates</th>
                  <th scope="col" class="num">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                @for (r of visibleRows(); track r.id) {
                  <tr>
                    <td class="cell-lead">
                      <div class="cell-media">
                        <span class="avatar" aria-hidden="true">{{ initials(tenantName(r)) }}</span>
                        <div class="cell-media__text">
                          <strong>{{ tenantName(r) }}</strong>
                          <span>{{ r.guestEmail || r.locataire!.email || '' }} @if (r.guests) { · {{ r.guests }} guests }</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Place">{{ r.lieu!.titre || '—' }}</td>
                    <td data-label="Dates">
                      <span class="num">{{ fmtRange(r.dateDebut, r.dateFin) }}</span>
                      <span class="cell-sub">{{ r.totalNights }} {{ r.totalNights === 1 ? 'night' : 'nights' }}</span>
                    </td>
                    <td data-label="Total" class="num">
                      <strong>{{ money(r.totalPrice ?? 0) }}</strong>
                    </td>
                    <td data-label="Status">
                      <app-status-badge [status]="r.statut" />
                      @if (r.specialRequests) {
                        <button class="btn btn--sm btn--ghost mt-1" type="button" (click)="readNote(r)">Read note</button>
                      }
                    </td>
                    <td class="cell-actions">
                      <div class="data-table__actions">
                        @if (r.statut === 'EN_ATTENTE') {
                          <button class="btn btn--sm btn--primary" type="button" (click)="act(r, 'CONFIRMEE', 'Confirm this reservation?', 'The tenant will be notified that their stay is confirmed.', true)">Confirm</button>
                          <button class="btn btn--sm btn--danger-outline" type="button" (click)="act(r, 'REFUSEE', 'Refuse this request?', 'The tenant will be notified. This cannot be undone.', true)">Refuse</button>
                        } @else if (r.statut === 'CONFIRMEE') {
                          <button class="btn btn--sm btn--secondary" type="button" (click)="act(r, 'TERMINEE', 'Mark this stay as completed?', 'Completing the stay lets the tenant leave a review.', false)">Mark completed</button>
                          <button class="btn btn--sm btn--danger-outline" type="button" (click)="act(r, 'ANNULEE', 'Cancel this confirmed reservation?', 'The tenant will be notified of the cancellation.', true)">Cancel</button>
                        } @else {
                          <span class="text-muted text-sm">Final</span>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      } @else {
        <app-skeleton-rows [count]="1" cssClass="skeleton--tall" />
      }
    </section>
  `
})
export class InboxComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private modal = inject(ModalService);

  readonly rows = signal<ReservationResponse[] | null>(null);
  readonly error = signal(false);
  readonly filter = signal<TabKey>('EN_ATTENTE');

  readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'EN_ATTENTE', label: 'Pending' },
    { key: 'CONFIRMEE', label: 'Confirmed' },
    { key: 'TERMINEE', label: 'Completed' },
    { key: 'ALL', label: 'All' }
  ];

  readonly tabCounts = computed(() => {
    const counts: Record<string, number> = {};
    for (const r of this.rows() || []) {
      counts[r.statut] = (counts[r.statut] || 0) + 1;
    }
    counts['ALL'] = (this.rows() || []).length;
    return counts;
  });

  readonly visibleRows = computed(() => {
    const all = this.rows() || [];
    const f = this.filter();
    return f === 'ALL' ? all : all.filter(r => r.statut === f);
  });

  readonly money = money;
  readonly fmtRange = fmtRange;
  readonly initials = initials;

  ngOnInit(): void {
    this.load();
  }

  tenantName(r: ReservationResponse): string {
    return r.guestName || r.locataire?.nom || '—';
  }

  load(): void {
    this.error.set(false);
    this.reservationService.owner().subscribe({
      next: (rows) => this.rows.set(rows),
      error: () => this.error.set(true)
    });
  }

  readNote(r: ReservationResponse): void {
    this.modal.open(NoteModalComponent, { title: `Note from ${this.tenantName(r)}` }, { body: r.specialRequests });
  }

  act(r: ReservationResponse, status: ReservationStatus, title: string, message: string, withMessage: boolean): void {
    this.modal.open(ActionModalComponent, { title }, {
      message,
      detail: `${this.tenantName(r)} · ${r.lieu?.titre || ''} · ${fmtRange(r.dateDebut, r.dateFin)} · ${money(r.totalPrice ?? 0)}`,
      confirmLabel: this.confirmLabelFor(status),
      danger: status === 'REFUSEE' || status === 'ANNULEE',
      withMessage,
      onConfirm: (ownerMessage: string | null) => {
        this.modal.close();
        this.reservationService.updateStatus(r.id, status, ownerMessage || undefined).subscribe({
          next: (updated) => {
            // Update in place — the row moves to its new status tab
            const rows = this.rows();
            if (!rows) return;
            const idx = rows.findIndex(x => x.id === r.id);
            if (idx >= 0) {
              const copy = rows.slice();
              copy[idx] = { ...copy[idx], ...updated, statut: updated.statut };
              this.rows.set(copy);
            }
          },
          error: () => {}
        });
      }
    });
  }

  private confirmLabelFor(status: ReservationStatus): string {
    switch (status) {
      case 'CONFIRMEE': return 'Confirm';
      case 'REFUSEE': return 'Refuse';
      case 'TERMINEE': return 'Mark completed';
      case 'ANNULEE': return 'Cancel';
      default: return 'Confirm';
    }
  }
}
