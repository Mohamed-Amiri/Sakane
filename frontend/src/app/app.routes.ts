import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { calendarRedirectGuard } from './features/owner/calendar/calendar-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then((m) => m.SearchComponent)
  },
  {
    path: 'places/:id',
    loadComponent: () => import('./features/place-detail/place-detail.component').then((m) => m.PlaceDetailComponent)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'reservations',
    canActivate: [roleGuard('LOCATAIRE')],
    loadComponent: () =>
      import('./features/tenant/reservations/reservations.component').then((m) => m.ReservationsComponent)
  },
  {
    path: 'favorites',
    canActivate: [roleGuard('LOCATAIRE')],
    loadComponent: () => import('./features/tenant/favorites/favorites.component').then((m) => m.FavoritesComponent)
  },
  {
    path: 'reviews',
    canActivate: [roleGuard('LOCATAIRE')],
    loadComponent: () => import('./features/tenant/reviews/reviews.component').then((m) => m.ReviewsComponent)
  },
  {
    path: 'reviews/new/:lieuId',
    canActivate: [roleGuard('LOCATAIRE')],
    loadComponent: () =>
      import('./features/tenant/review-form/review-form.component').then((m) => m.ReviewFormComponent)
  },
  {
    path: 'reviews/:avisId/edit',
    canActivate: [roleGuard('LOCATAIRE')],
    loadComponent: () =>
      import('./features/tenant/review-form/review-form.component').then((m) => m.ReviewFormComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tenant/profile/profile.component').then((m) => m.ProfileComponent)
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tenant/notifications/notifications.component').then((m) => m.NotificationsComponent)
  },
  {
    path: 'owner/dashboard',
    canActivate: [roleGuard('PROPRIETAIRE')],
    loadComponent: () => import('./features/owner/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'owner/places',
    canActivate: [roleGuard('PROPRIETAIRE')],
    loadComponent: () => import('./features/owner/places/places.component').then((m) => m.PlacesComponent)
  },
  {
    path: 'owner/places/new',
    canActivate: [roleGuard('PROPRIETAIRE')],
    loadComponent: () => import('./features/owner/place-form/place-form.component').then((m) => m.PlaceFormComponent)
  },
  {
    path: 'owner/places/:id/edit',
    canActivate: [roleGuard('PROPRIETAIRE')],
    loadComponent: () => import('./features/owner/place-form/place-form.component').then((m) => m.PlaceFormComponent)
  },
  {
    path: 'owner/calendar',
    // Always redirects (to the current/first place's calendar, or to /owner/places when the owner has none) — this component never renders.
    canActivate: [roleGuard('PROPRIETAIRE'), calendarRedirectGuard],
    loadComponent: () => import('./features/owner/calendar/calendar.component').then((m) => m.CalendarComponent)
  },
  {
    path: 'owner/places/:id/calendar',
    canActivate: [roleGuard('PROPRIETAIRE')],
    loadComponent: () => import('./features/owner/calendar/calendar.component').then((m) => m.CalendarComponent)
  },
  {
    path: 'owner/reservations',
    canActivate: [roleGuard('PROPRIETAIRE')],
    loadComponent: () => import('./features/owner/inbox/inbox.component').then((m) => m.InboxComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent)
  }
];
