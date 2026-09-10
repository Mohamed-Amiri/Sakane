import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, IconName } from '../icon/icon.component';

interface SubnavLink {
  path: string;
  label: string;
  icon: IconName;
}

/** Single source of owner secondary navigation, rendered on every /owner/** page (js/ui.js OWNER_SUBNAV). */
@Component({
  selector: 'app-owner-subnav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="subnav" aria-label="Owner area">
      @for (link of links; track link.path) {
        <a
          [routerLink]="link.path"
          routerLinkActive
          #rla="routerLinkActive"
          [routerLinkActiveOptions]="{ exact: true }"
          [attr.aria-current]="rla.isActive ? 'page' : null"
        >
          <app-icon [name]="link.icon" />
          <span>{{ link.label }}</span>
        </a>
      }
    </nav>
  `
})
export class OwnerSubnavComponent {
  readonly links: SubnavLink[] = [
    { path: '/owner/dashboard', label: 'Dashboard', icon: 'grid' },
    { path: '/owner/places', label: 'My places', icon: 'building' },
    { path: '/owner/places/new', label: 'Create place', icon: 'plus' },
    { path: '/owner/calendar', label: 'Calendar', icon: 'calendar' },
    { path: '/owner/reservations', label: 'Requests', icon: 'inbox' }
  ];
}
