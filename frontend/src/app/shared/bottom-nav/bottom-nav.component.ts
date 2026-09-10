import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { IconComponent, IconName } from '../icon/icon.component';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

const TENANT_ITEMS: NavItem[] = [
  { path: '/', label: 'Explore', icon: 'home' },
  { path: '/search', label: 'Search', icon: 'search' },
  { path: '/reservations', label: 'My trips', icon: 'calendar' },
  { path: '/favorites', label: 'Favorites', icon: 'heart' }
];

const OWNER_ITEMS: NavItem[] = [
  { path: '/owner/dashboard', label: 'Dashboard', icon: 'grid' },
  { path: '/owner/places', label: 'My places', icon: 'building' },
  { path: '/owner/reservations', label: 'Requests', icon: 'inbox' },
  { path: '/', label: 'Explore', icon: 'home' }
];

const ACCOUNT_ITEM: NavItem = { path: '/profile', label: 'Account', icon: 'user' };

/** Bottom tab bar for signed-in users on phones (≤860px) — js/ui.js bottom-nav. */
@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (auth.isAuthenticated()) {
      <nav class="bottom-nav" aria-label="Primary">
        <div class="bottom-nav__inner">
          @for (item of items(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: item.path === '/' }" #rla="routerLinkActive" [attr.aria-current]="rla.isActive ? 'page' : null">
              <app-icon [name]="item.icon" />
              <span>{{ item.label }}</span>
            </a>
          }
        </div>
      </nav>
    }
  `
})
export class BottomNavComponent {
  constructor(public readonly auth: AuthService) {
    effect(() => {
      document.body.classList.toggle('has-bottom-nav', this.auth.isAuthenticated());
    });
  }

  items(): NavItem[] {
    const base = this.auth.role() === 'PROPRIETAIRE' ? OWNER_ITEMS : TENANT_ITEMS;
    return [...base, ACCOUNT_ITEM];
  }
}
