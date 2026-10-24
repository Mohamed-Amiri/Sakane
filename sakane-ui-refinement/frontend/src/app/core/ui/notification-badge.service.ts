import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../api/notification.service';

/**
 * Shared unread-notification count for the header bell (§4.9 — "Unread
 * badge refreshed after any action that creates notifications"). Feature
 * components should call `refresh()` after any action that could create a
 * notification for the current user (booking created/cancelled, owner
 * status changes) or after marking notifications read.
 */
@Injectable({ providedIn: 'root' })
export class NotificationBadgeService {
  private readonly countSignal = signal<number | null>(null);
  readonly unreadCount = this.countSignal.asReadonly();

  constructor(
    private readonly notifications: NotificationService,
    private readonly auth: AuthService
  ) {
    // React to login/logout. An observable subscription (not an effect) so
    // writing to countSignal is allowed — effects forbid signal writes.
    toObservable(this.auth.isAuthenticated)
      .pipe(distinctUntilChanged())
      .subscribe(authed => {
        if (authed) {
          this.refresh();
        } else {
          this.countSignal.set(null);
        }
      });
  }

  refresh(): void {
    if (!this.auth.isAuthenticated()) {
      this.countSignal.set(null);
      return;
    }
    this.notifications.unreadCount().subscribe({
      next: (n) => this.countSignal.set(n),
      error: () => this.countSignal.set(null)
    });
  }
}
