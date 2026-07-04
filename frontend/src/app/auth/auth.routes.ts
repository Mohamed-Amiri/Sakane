import { Routes } from '@angular/router';
import { NoAuthGuard } from './auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component')
      .then(m => m.LoginComponent),
    canActivate: [NoAuthGuard],
    title: 'Connexion - Sakane'
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component')
      .then(m => m.RegisterComponent),
    canActivate: [NoAuthGuard],
    title: 'Inscription - Sakane'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent),
    canActivate: [NoAuthGuard],
    title: 'Mot de passe oublié - Sakane'
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password.component')
      .then(m => m.ResetPasswordComponent),
    canActivate: [NoAuthGuard],
    title: 'Réinitialisation du mot de passe - Sakane'
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./verify-email/verify-email.component')
      .then(m => m.VerifyEmailComponent),
    canActivate: [NoAuthGuard],
    title: 'Vérification email - Sakane'
  }
];