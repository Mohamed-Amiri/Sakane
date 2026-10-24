import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { JwtResponse } from '../api/models';
import { AuthService } from './auth.service';

const JWT: JwtResponse = {
  accessToken: 'token-abc',
  tokenType: 'Bearer',
  id: 1,
  email: 'lea@demo.io',
  nom: 'Lea Martin',
  roles: ['ROLE_LOCATAIRE'],
  frontendRole: 'LOCATAIRE'
};

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('starts with no session', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.role()).toBeNull();
  });

  it('stores the session in localStorage when "remember" is true', () => {
    const auth = TestBed.inject(AuthService);
    auth.store(JWT, true);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.role()).toBe('LOCATAIRE');
    expect(localStorage.getItem('sakane_session_v1')).not.toBeNull();
    expect(sessionStorage.getItem('sakane_session_v1')).toBeNull();
  });

  it('stores the session in sessionStorage when "remember" is false', () => {
    const auth = TestBed.inject(AuthService);
    auth.store(JWT, false);
    expect(sessionStorage.getItem('sakane_session_v1')).not.toBeNull();
    expect(localStorage.getItem('sakane_session_v1')).toBeNull();
  });

  it('clear() removes the session from both storages', () => {
    const auth = TestBed.inject(AuthService);
    auth.store(JWT, true);
    auth.clear();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('sakane_session_v1')).toBeNull();
  });

  it('treats a stored token older than 24h as expired on restore', () => {
    const stale = {
      ...JWT,
      issuedAt: Date.now() - 25 * 60 * 60 * 1000
    };
    localStorage.setItem('sakane_session_v1', JSON.stringify(stale));

    const auth = TestBed.inject(AuthService);

    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('sakane_session_v1')).toBeNull();
  });

  it('restores a session younger than 24h', () => {
    const fresh = { ...JWT, issuedAt: Date.now() - 60 * 1000 };
    localStorage.setItem('sakane_session_v1', JSON.stringify(fresh));

    const auth = TestBed.inject(AuthService);

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.role()).toBe('LOCATAIRE');
  });

  it('homeFor routes owners to the dashboard and tenants to home', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.homeFor('PROPRIETAIRE')).toBe('/owner/dashboard');
    expect(auth.homeFor('LOCATAIRE')).toBe('/');
    expect(auth.homeFor(null)).toBe('/');
  });
});
