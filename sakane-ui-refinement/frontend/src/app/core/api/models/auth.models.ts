export type Role = 'LOCATAIRE' | 'PROPRIETAIRE';

/** POST /api/auth/register (§7.1) */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Role;
}

/** POST /api/auth/login (§7.1) */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Response of POST /api/auth/login (§7.1). Note: token field is `accessToken`, not `token`. */
export interface JwtResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  email: string;
  nom: string;
  roles: string[];
  frontendRole: Role;
}

/** Persisted session identity — JwtResponse + local bookkeeping. */
export interface Session {
  accessToken: string;
  tokenType: string;
  id: number;
  email: string;
  nom: string;
  roles: string[];
  frontendRole: Role;
  issuedAt: number;
}
