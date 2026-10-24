import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtResponse, LoginRequest, RegisterRequest, Role, Session } from '../api/models';

const SESSION_KEY = 'sakane_session_v1';
/** JWT lifetime is 24h server-side (§9) and cannot be refreshed — treat a
 *  stored token older than this as expired without waiting for a 401. */
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionSignal = signal<Session | null>(this.restore());

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly role = computed<Role | null>(() => this.sessionSignal()?.frontendRole ?? null);

  constructor(private readonly http: HttpClient) {}

  register(payload: RegisterRequest): Observable<string> {
    return this.http.post(`${environment.apiBaseUrl}/api/auth/register`, payload, {
      responseType: 'text'
    });
  }

  login(payload: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${environment.apiBaseUrl}/api/auth/login`, payload);
  }

  /** Stateless no-op server-side; still called so any future backend hooks work. */
  logout(): Observable<string> {
    return this.http.post(`${environment.apiBaseUrl}/api/auth/logout`, {}, { responseType: 'text' });
  }

  store(jwt: JwtResponse, remember: boolean): Session {
    const session: Session = {
      accessToken: jwt.accessToken,
      tokenType: jwt.tokenType,
      id: jwt.id,
      email: jwt.email,
      nom: jwt.nom,
      roles: jwt.roles,
      frontendRole: jwt.frontendRole,
      issuedAt: Date.now()
    };
    this.clearStorage();
    if (remember) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    this.sessionSignal.set(session);
    return session;
  }

  /** Used after a profile update so the header/menu reflect the new name/email. */
  patchIdentity(patch: Partial<Pick<Session, 'nom' | 'email'>>): void {
    const current = this.sessionSignal();
    if (!current) return;
    const updated: Session = { ...current, ...patch };
    if (localStorage.getItem(SESSION_KEY)) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    } else if (sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    }
    this.sessionSignal.set(updated);
  }

  clear(): void {
    this.clearStorage();
    this.sessionSignal.set(null);
  }

  hasRole(role: Role): boolean {
    return this.sessionSignal()?.frontendRole === role;
  }

  homeFor(role: Role | null | undefined): string {
    return role === 'PROPRIETAIRE' ? '/owner/dashboard' : '/';
  }

  currentToken(): string | null {
    return this.sessionSignal()?.accessToken ?? null;
  }

  private restore(): Session | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Session;
      if (!parsed?.accessToken) return null;
      if (Date.now() - (parsed.issuedAt || 0) > TOKEN_TTL_MS) {
        this.clearStorage();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
}
