import { ChangeDetectionStrategy, Component, ElementRef, HostListener, signal, Signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationBadgeService } from '../../core/ui/notification-badge.service';
import { Session } from '../../core/api/models';
import { initials } from '../../core/ui/format';
import { BrandMarkComponent } from '../icon/brand-mark.component';
import { IconComponent, IconName } from '../icon/icon.component';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

const NAV_PUBLIC: NavItem[] = [
  { path: '/', label: 'Explore', icon: 'home' },
  { path: '/search', label: 'Search', icon: 'search' }
];

const NAV_TENANT: NavItem[] = [
  { path: '/', label: 'Explore', icon: 'home' },
  { path: '/search', label: 'Search', icon: 'search' },
  { path: '/reservations', label: 'My trips', icon: 'calendar' },
  { path: '/favorites', label: 'Favorites', icon: 'heart' },
  { path: '/reviews', label: 'My reviews', icon: 'star' }
];

const NAV_OWNER: NavItem[] = [
  { path: '/owner/dashboard', label: 'Dashboard', icon: 'grid' },
  { path: '/owner/places', label: 'My places', icon: 'building' },
  { path: '/owner/reservations', label: 'Requests', icon: 'inbox' },
  { path: '/', label: 'Explore', icon: 'home' }
];

/** App header: brand, main nav, notifications bell, account menu / auth CTAs, mobile nav (js/ui.js renderShell header). */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, BrandMarkComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div class="container app-header__inner">
        <button
          class="nav-toggle"
          type="button"
          [attr.aria-label]="mobileOpen() ? 'Close menu' : 'Open menu'"
          [attr.aria-expanded]="mobileOpen()"
          aria-controls="mobile-nav"
          (click)="mobileOpen.set(!mobileOpen())"
        >
          <app-icon [name]="mobileOpen() ? 'close' : 'menu'" />
        </button>

        <a class="brand" [routerLink]="brandHome()" aria-label="Sakane home">
          <app-brand-mark />
          <span>Sakane</span>
        </a>

        <nav class="main-nav" aria-label="Main">
          @for (item of navItems(); track item.path) {
            <a
              class="main-nav__link"
              [routerLink]="item.path"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
              #rla="routerLinkActive"
              [attr.aria-current]="rla.isActive ? 'page' : null"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="header-actions">
          @if (auth.isAuthenticated()) {
            <a class="icon-btn" routerLink="/notifications" aria-label="Notifications">
              <app-icon name="bell" />
              @if (unread()) {
                <span class="badge-dot" aria-hidden="true">{{ unread()! > 9 ? '9+' : unread() }}</span>
              }
            </a>
            <div style="position:relative">
              <button
                class="user-chip"
                type="button"
                aria-haspopup="menu"
                [attr.aria-expanded]="menuOpen()"
                aria-label="Account menu"
                (click)="menuOpen.set(!menuOpen())"
              >
                <span class="user-chip__avatar" aria-hidden="true">{{ initials(session()?.nom) }}</span>
                <span class="user-chip__name-wrap">
                  <span>{{ firstName() }}</span>
                  <span class="user-chip__role">{{ isOwner() ? 'Owner' : 'Tenant' }}</span>
                </span>
                <span class="user-chip__caret"><app-icon name="chevron" /></span>
              </button>
              @if (menuOpen()) {
                <div class="menu-pop" role="menu" (keydown)="onMenuKeydown($event)">
                  <div class="menu-pop__id">
                    <strong>{{ session()?.nom }}</strong>
                    <span>{{ session()?.email }}</span>
                  </div>
                  <a role="menuitem" routerLink="/profile" (click)="menuOpen.set(false)">Profile &amp; account</a>
                  <a role="menuitem" routerLink="/notifications" (click)="menuOpen.set(false)">Notifications</a>
                  @if (!isOwner()) {
                    <a role="menuitem" routerLink="/reviews" (click)="menuOpen.set(false)">My reviews</a>
                  }
                  <hr />
                  <button role="menuitem" type="button" (click)="logout()">Log out</button>
                </div>
              }
            </div>
          } @else {
            <a class="btn btn--ghost btn--sm" routerLink="/login">Log in</a>
            <a class="btn btn--primary btn--sm" routerLink="/register">Sign up</a>
          }
        </div>
      </div>

      <nav class="mobile-nav" id="mobile-nav" [class.is-open]="mobileOpen()" aria-label="Menu">
        @if (auth.isAuthenticated()) {
          <a routerLink="/profile" (click)="mobileOpen.set(false)">Profile &amp; account</a>
          <a routerLink="/notifications" (click)="mobileOpen.set(false)">Notifications</a>
          @if (!isOwner()) {
            <a routerLink="/reviews" (click)="mobileOpen.set(false)">My reviews</a>
          }
          <button type="button" (click)="logout()">Log out</button>
        } @else {
          @for (item of navItems(); track item.path) {
            <a [routerLink]="item.path" (click)="mobileOpen.set(false)">{{ item.label }}</a>
          }
          <a routerLink="/login" (click)="mobileOpen.set(false)">Log in</a>
          <a routerLink="/register" (click)="mobileOpen.set(false)">Create account</a>
        }
      </nav>
    </header>
  `
})
export class HeaderComponent {
  readonly menuOpen = signal(false);
  readonly mobileOpen = signal(false);
  readonly initials = initials;

  readonly session: Signal<Session | null>;
  readonly unread: Signal<number | null>;

  constructor(
    public readonly auth: AuthService,
    private readonly badge: NotificationBadgeService,
    private readonly router: Router,
    private readonly host: ElementRef<HTMLElement>
  ) {
    this.session = this.auth.session;
    this.unread = this.badge.unreadCount;
  }

  isOwner(): boolean {
    return this.auth.role() === 'PROPRIETAIRE';
  }

  firstName(): string {
    return this.session()?.nom.split(' ')[0] ?? '';
  }

  brandHome(): string {
    return this.auth.homeFor(this.auth.role());
  }

  navItems(): NavItem[] {
    if (!this.auth.isAuthenticated()) return NAV_PUBLIC;
    return this.isOwner() ? NAV_OWNER : NAV_TENANT;
  }

  logout(): void {
    this.menuOpen.set(false);
    this.mobileOpen.set(false);
    this.auth.logout().subscribe({
      complete: () => this.afterLogout(),
      error: () => this.afterLogout()
    });
  }

  private afterLogout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menuOpen.set(false);
  }

  onMenuKeydown(event: KeyboardEvent): void {
    const items = Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role=menuitem]'));
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    }
  }
}
