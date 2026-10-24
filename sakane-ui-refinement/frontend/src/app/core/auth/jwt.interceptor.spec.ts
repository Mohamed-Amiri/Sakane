import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { JwtResponse } from '../api/models';
import { AuthService } from './auth.service';
import { jwtInterceptor } from './jwt.interceptor';

const JWT: JwtResponse = {
  accessToken: 'secret-token',
  tokenType: 'Bearer',
  id: 1,
  email: 'lea@demo.io',
  nom: 'Lea Martin',
  roles: ['ROLE_LOCATAIRE'],
  frontendRole: 'LOCATAIRE'
};

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([jwtInterceptor])), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('attaches the bearer token to a protected /api/** request', () => {
    auth.store(JWT, true);
    http.get(`${environment.apiBaseUrl}/api/lieux/my`).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/lieux/my`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer secret-token');
    req.flush([]);
  });

  it('does not attach a token to /api/auth/login', () => {
    auth.store(JWT, true);
    http.post(`${environment.apiBaseUrl}/api/auth/login`, {}).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/auth/login`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does not attach a token to /api/auth/register', () => {
    auth.store(JWT, true);
    http.post(`${environment.apiBaseUrl}/api/auth/register`, {}).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/auth/register`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush('ok');
  });

  it('does not attach a token to /uploads/** requests', () => {
    auth.store(JWT, true);
    http.get(`${environment.apiBaseUrl}/uploads/photo.jpg`).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/uploads/photo.jpg`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush('binary');
  });

  it('does not attach a token when there is no session', () => {
    http.get(`${environment.apiBaseUrl}/api/lieux`).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/lieux`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
