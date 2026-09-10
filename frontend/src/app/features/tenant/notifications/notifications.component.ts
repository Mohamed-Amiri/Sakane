import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/api/notification.service';
import { NotificationResponse, NotificationType } from '../../../core/api/models';
import { SkeletonRowsComponent } from '../../../shared/skeleton/skeleton-rows.component';
import { StateBlockComponent } from '../../../shared/state-block/state-block.component';

const TYPE_ICON: Record<NotificationType, string> = {
  RESERVATION_NEW: 'calendar',
  RESERVATION_CONFIRMED: 'check',
  RESERVATION_CANCELLED: 'x',
  SYSTEM: 'bell'
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SkeletonRowsComponent, StateBlockComponent],
  template: `
    <section class="container container--reading page-section">
      <div class="page-head">
        <div>
          <h1>Notifications</h1>
          <p class="page-head__sub">Reservation events for your account.</p>
        </div>
        @if (unreadCount() > 0) {
          <button class="btn btn--secondary" type="button" [class.is-loading]="markingAll()" (click)="markAllRead()">
            <span class="spinner" aria-hidden="true"></span><span>Mark all read</span>
          </button>
        }
      </div>

      @if (error()) {
        <app-state-block kind="error" icon="warn" title="Could not load notifications" message="Your notifications could not be loaded." (retry)="load()" />
      } @else if (rows() !== null) {
        @if (!rows()!.length) {
          <app-state-block
            icon="bell"
            title="No notifications"
            message="You're all caught up. Notifications about your reservations and account will appear here."
          />
        } @else {
          <div class="notif-list" id="notif-list" aria-live="polite">
            @for (n of rows()!; track n.id) {
              <article class="notif" [class.is-unread]="!n.lu">
                <span class="notif__icon" aria-hidden="true">{{ typeIcon(n.type) }}</span>
                <div class="notif__body">
                  <strong>{{ n.title }}</strong>
                  <p class="text-secondary mb-0">{{ n.message }}</p>
                </div>
                @if (!n.lu) {
                  <button class="btn btn--sm btn--ghost" type="button" (click)="markRead(n)">Mark read</button>
                }
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
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  readonly rows = signal<NotificationResponse[] | null>(null);
  readonly error = signal(false);
  readonly unreadCount = signal(0);
  readonly markingAll = signal(false);

  ngOnInit(): void {
    this.load();
  }

  typeIcon(type: NotificationType): string {
    return TYPE_ICON[type] || 'bell';
  }

  load(): void {
    this.error.set(false);
    this.notificationService.list().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.unreadCount.set(rows.filter(r => !r.lu).length);
      },
      error: () => this.error.set(true)
    });
  }

  markRead(n: NotificationResponse): void {
    this.notificationService.markRead(n.id).subscribe({
      next: () => {
        this.rows.update(all => (all || []).map(x => x.id === n.id ? { ...x, lu: true } : x));
        this.unreadCount.update(c => Math.max(0, c - 1));
      },
      error: () => {}
    });
  }

  markAllRead(): void {
    this.markingAll.set(true);
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.rows.update(all => (all || []).map(x => ({ ...x, lu: true })));
        this.unreadCount.set(0);
        this.markingAll.set(false);
      },
      error: () => this.markingAll.set(false)
    });
  }
}
