import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiError } from '../api/models';
import { AuthService } from './auth.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('normalises a validation 400 into ApiError with the ValidationErrorResponse body', (done) => {
    http.post(`${environment.apiBaseUrl}/api/lieux`, {}).subscribe({
      error: (err: ApiError) => {
        expect(err.status).toBe(400);
        expect(err.body?.message).toBe('Request validation failed');
        expect((err.body as any).validationErrors.titre).toBe('Title is required');
        done();
      }
    });
    httpMock
      .expectOne(`${environment.apiBaseUrl}/api/lieux`)
      .flush(
        {
          status: 400,
          error: 'Validation Failed',
          message: 'Request validation failed',
          path: '/api/lieux',
          timestamp: '2026-01-01T00:00:00',
          validationErrors: { titre: 'Title is required' }
        },
        { status: 400, statusText: 'Bad Request' }
      );
  });

  it('normalises an empty-body failure (e.g. reservation create 409) to a null body', (done) => {
    http.post(`${environment.apiBaseUrl}/api/reservations`, {}).subscribe({
      error: (err: ApiError) => {
        expect(err.status).toBe(409);
        expect(err.body).toBeNull();
        done();
      }
    });
    httpMock
      .expectOne(`${environment.apiBaseUrl}/api/reservations`)
      .flush(null, { status: 409, statusText: 'Conflict' });
  });

  it('clears the session and redirects to /login?reason=expired on a "Full authentication" 401', (done) => {
    auth.store(
      {
        accessToken: 't',
        tokenType: 'Bearer',
        id: 1,
        email: 'lea@demo.io',
        nom: 'Lea',
        roles: ['ROLE_LOCATAIRE'],
        frontendRole: 'LOCATAIRE'
      },
      true
    );
    const navigateSpy = spyOn(router, 'navigate');

    http.get(`${environment.apiBaseUrl}/api/users/me`).subscribe({
      error: () => {
        expect(auth.isAuthenticated()).toBe(false);
        expect(navigateSpy).toHaveBeenCalledWith(['/login'], { queryParams: { reason: 'expired' } });
        done();
      }
    });

    httpMock.expectOne(`${environment.apiBaseUrl}/api/users/me`).flush(
      {
        status: 401,
        error: 'Unauthorized',
        message: 'Full authentication is required to access this resource',
        path: '/api/users/me',
        timestamp: '2026-01-01T00:00:00'
      },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  it('does NOT log out on a business-authorization 401 (e.g. "not the author")', (done) => {
    auth.store(
      {
        accessToken: 't',
        tokenType: 'Bearer',
        id: 1,
        email: 'lea@demo.io',
        nom: 'Lea',
        roles: ['ROLE_LOCATAIRE'],
        frontendRole: 'LOCATAIRE'
      },
      true
    );
    const navigateSpy = spyOn(router, 'navigate');

    http.delete(`${environment.apiBaseUrl}/api/avis/5`).subscribe({
      error: (err: ApiError) => {
        expect(auth.isAuthenticated()).toBe(true);
        expect(navigateSpy).not.toHaveBeenCalled();
        expect(err.body?.message).toBe('You are not the author of this review');
        done();
      }
    });

    httpMock.expectOne(`${environment.apiBaseUrl}/api/avis/5`).flush(
      {
        status: 401,
        error: 'Unauthorized',
        message: 'You are not the author of this review',
        path: '/api/avis/5',
        timestamp: '2026-01-01T00:00:00'
      },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  it('normalises a network failure (status 0) with a null body', (done) => {
    http.get(`${environment.apiBaseUrl}/api/lieux`).subscribe({
      error: (err: ApiError) => {
        expect(err.status).toBe(0);
        expect(err.body).toBeNull();
        done();
      }
    });
    httpMock.expectOne(`${environment.apiBaseUrl}/api/lieux`).error(new ProgressEvent('error'));
  });
});
