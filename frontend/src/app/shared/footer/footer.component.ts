import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BrandMarkComponent } from '../icon/brand-mark.component';

interface FooterLink {
  path: string;
  label: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

/**
 * App footer (js/ui.js renderShell footer). The demo "Reset" button and
 * `__PREVIEW_*` hooks from the prototype are intentionally not ported —
 * there is no mock/demo layer in the Angular app (§1 rules).
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, BrandMarkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="app-footer">
      <div class="container">
        <div class="app-footer__top">
          <div class="app-footer__id">
            <span class="app-footer__brand"><app-brand-mark />Sakane</span>
            <p>Places to stay, work and celebrate — booked directly with their owners.</p>
          </div>
          <div class="app-footer__cols">
            @for (col of columns(); track col.title) {
              <div class="app-footer__col">
                <h4>{{ col.title }}</h4>
                @for (link of col.links; track link.path) {
                  <a [routerLink]="link.path">{{ link.label }}</a>
                }
              </div>
            }
          </div>
        </div>
        <div class="app-footer__base">
          <span>© 2026 Sakane</span>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  constructor(private readonly auth: AuthService) {}

  columns(): FooterColumn[] {
    const discover: FooterColumn = {
      title: 'Discover',
      links: [
        { path: '/', label: 'Explore' },
        { path: '/search', label: 'Search' }
      ]
    };

    if (!this.auth.isAuthenticated()) {
      return [
        discover,
        {
          title: 'Account',
          links: [
            { path: '/login', label: 'Log in' },
            { path: '/register', label: 'Create account' }
          ]
        },
        { title: 'Owners', links: [{ path: '/register', label: 'Publish a place' }] }
      ];
    }

    if (this.auth.role() === 'LOCATAIRE') {
      return [
        discover,
        {
          title: 'Your account',
          links: [
            { path: '/reservations', label: 'My trips' },
            { path: '/favorites', label: 'Favorites' },
            { path: '/reviews', label: 'My reviews' },
            { path: '/profile', label: 'Profile' }
          ]
        }
      ];
    }

    return [
      discover,
      {
        title: 'Manage',
        links: [
          { path: '/owner/dashboard', label: 'Dashboard' },
          { path: '/owner/places', label: 'My places' },
          { path: '/owner/calendar', label: 'Calendar' },
          { path: '/owner/reservations', label: 'Requests' }
        ]
      },
      {
        title: 'Your account',
        links: [
          { path: '/profile', label: 'Profile' },
          { path: '/notifications', label: 'Notifications' }
        ]
      }
    ];
  }
}
