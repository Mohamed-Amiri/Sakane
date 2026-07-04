import { Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';

// Direct tenant routes - flat structure for better routing
export const LOCATAIRE_ROUTES: Routes = [
    {
        path: 'locataire/dashboard',
        loadComponent: () => import('./tenant-dashboard/tenant-dashboard.component').then(m => m.TenantDashboardComponent),
        canActivate: [AuthGuard],
        data: { roles: ['tenant'] },
        title: 'Tableau de bord - Sakane'
    },
    {
        path: 'locataire/search',
        loadComponent: () => import('./tenant-search/tenant-search.component').then(m => m.TenantSearchComponent),
        title: 'Rechercher - Sakane'
    },
    {
        path: 'locataire/place/:id',
        loadComponent: () => import('./place-details/place-details.component').then(m => m.PlaceDetailsComponent),
        title: 'Détails du logement - Sakane'
    },
    {
        path: 'locataire/booking-confirm/:id',
        loadComponent: () => import('./booking-confirm/booking-confirm.component').then(m => m.BookingConfirmComponent),
        canActivate: [AuthGuard],
        data: { roles: ['tenant'] },
        title: 'Confirmer la réservation - Sakane'
    },
    {
        path: 'locataire/reservations',
        loadComponent: () => import('./reservations/reservations.component').then(m => m.ReservationsComponent),
        canActivate: [AuthGuard],
        data: { roles: ['tenant'] },
        title: 'Mes réservations - Sakane'
    },
    {
        path: 'locataire/reservations/:id',
        loadComponent: () => import('./reservation-detail/reservation-detail.component').then(m => m.ReservationDetailComponent),
        canActivate: [AuthGuard],
        data: { roles: ['tenant'] },
        title: 'Détails de la réservation - Sakane'
    },
    {
        path: 'locataire/favorites',
        loadComponent: () => import('./favorites/favorites.component').then(m => m.FavoritesComponent),
        canActivate: [AuthGuard],
        data: { roles: ['tenant'] },
        title: 'Mes favoris - Sakane'
    },
    {
        path: 'locataire',
        redirectTo: 'locataire/dashboard',
        pathMatch: 'full'
    }
];

export const LOCATAIRE_MODULE_ROUTE = LOCATAIRE_ROUTES;