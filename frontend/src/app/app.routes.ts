import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AUTH_ROUTES } from './auth/auth.routes';
import { proprietairesRoutes } from './proprietaires/proprietaires.routes';
import { AppLayoutComponent } from './app-layout.component';


const Home = () => import('./home/home.component').then(m => m.HomeComponent);
const LieuSearch = () => import('./lieux/lieu-search/lieu-search.component').then(m => m.LieuSearchComponent);
const LieuDetail = () => import('./lieux/lieu-detail/lieu-detail.component').then(m => m.LieuDetailComponent);
const ReservationWizard = () => import('./reservation/reservation-wizard/reservation-wizard.component').then(m => m.ReservationWizardComponent);
const About = () => import('./static/about/about.component').then(m => m.AboutComponent);
const Contact = () => import('./static/contact/contact.component').then(m => m.ContactComponent);
const Terms = () => import('./static/terms/terms.component').then(m => m.TermsComponent);
const Privacy = () => import('./static/privacy/privacy.component').then(m => m.PrivacyComponent);
const NotFound = () => import('./static/not-found/not-found.component').then(m => m.NotFoundComponent);

export const routes: Routes = [
  // ─── Public Routes (no auth required, no sidebar) ────────────────
  {
    path: '',
    loadComponent: Home,
    title: 'Accueil - Sakane'
  },
  {
    path: 'lieux',
    loadComponent: LieuSearch,
    title: 'Explorer les lieux - Sakane'
  },
  {
    path: 'lieux/:id',
    loadComponent: LieuDetail,
    title: 'Détails du lieu - Sakane'
  },
  {
    path: 'search',
    redirectTo: '/locataire/search',
    pathMatch: 'full'
  },
  {
    path: 'about',
    loadComponent: About,
    title: 'À propos - Sakane'
  },
  {
    path: 'contact',
    loadComponent: Contact,
    title: 'Contact - Sakane'
  },
  {
    path: 'terms',
    loadComponent: Terms,
    title: "Conditions d'utilisation - Sakane"
  },
  {
    path: 'privacy',
    loadComponent: Privacy,
    title: 'Politique de confidentialité - Sakane'
  },

  // ─── Auth Routes (login, register, forgot-password, etc.) ─────────
  ...AUTH_ROUTES,

  // ─── Protected standalone pages (no sidebar layout) ───────────────
  {
    path: 'reservation/:id',
    loadComponent: ReservationWizard,
    canActivate: [AuthGuard],
    title: 'Réservation - Sakane'
  },
  {
    path: 'profil',
    loadComponent: () => import('./shared/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard],
    title: 'Mon Profil - Sakane'
  },

  // ─── Protected: Locataire (with sidebar layout) ───────────────────
  {
    path: 'locataire',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./locataire/tenant-dashboard/tenant-dashboard.component').then(m => m.TenantDashboardComponent),
        canActivate: [AuthGuard],
        data: { roles: ['tenant'] },
        title: 'Tableau de bord - Sakane'
      },
      {
        path: 'search',
        loadComponent: () => import('./locataire/tenant-search/tenant-search.component').then(m => m.TenantSearchComponent),
        title: 'Rechercher - Sakane'
      },
      {
        path: 'place/:id',
        loadComponent: () => import('./locataire/place-details/place-details.component').then(m => m.PlaceDetailsComponent),
        title: 'Détails du logement - Sakane'
      },
      {
        path: 'booking-confirm/:id',
        loadComponent: () => import('./locataire/booking-confirm/booking-confirm.component').then(m => m.BookingConfirmComponent),
        canActivate: [AuthGuard],
        data: { roles: ['tenant'] },
        title: 'Confirmer la réservation - Sakane'
      },
      {
        path: 'reservations',
        loadComponent: () => import('./locataire/reservations/reservations.component').then(m => m.ReservationsComponent),
        canActivate: [AuthGuard],
        data: { roles: ['tenant'] },
        title: 'Mes réservations - Sakane'
      },
      {
        path: 'reservations/:id',
        loadComponent: () => import('./locataire/reservation-detail/reservation-detail.component').then(m => m.ReservationDetailComponent),
        canActivate: [AuthGuard],
        data: { roles: ['tenant'] },
        title: 'Détails de la réservation - Sakane'
      },
      {
        path: 'favorites',
        loadComponent: () => import('./locataire/favorites/favorites.component').then(m => m.FavoritesComponent),
        canActivate: [AuthGuard],
        data: { roles: ['tenant'] },
        title: 'Mes favoris - Sakane'
      }
    ]
  },

  // ─── Protected: Proprietaires (with sidebar layout) ───────────────
  {
    path: 'proprietaires',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['owner'] },
    children: proprietairesRoutes
  },

  // ─── 404 ─────────────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: NotFound,
    title: 'Page non trouvée - Sakane'
  }
];