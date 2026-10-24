# Sakane — LocaSpace

A full-stack vacation-rental platform for Morocco-inspired stays. Two applications live in this repository:

| App | Stack | Default port |
|---|---|---|
| `backend/` | Spring Boot 3.5 (Java 17), Spring Security + JWT, JPA/Hibernate, H2 | **8082** |
| `frontend/` | Angular 18 (standalone components, signals), custom CSS design system | **4200** |

---

## Features

### Public
- Home page with featured places and owner CTA
- Search: keyword, type, price range, city filters (paginated)
- Place detail: photo gallery + lightbox, amenities, availability check, reviews, ratings & stats
- Login / Register (with password visibility toggle and demo-account chips)

### Tenant (`LOCATAIRE`)
- Book a place (date range validated against availability), cancel a reservation
- Favorites
- Write / edit / delete reviews on stayed places
- Profile management, notifications with unread badge

### Owner (`PROPRIETAIRE`)
- Dashboard with earnings & occupancy stats
- Place management: create (with **integrated photo upload** — drag & drop files or image URLs in the same form), edit, delete
- Photo management: upload files, add by URL, reorder (cover first), delete
- Availability calendar: block dates, manage calendar events
- Inbox: reservation requests, accept / refuse, update status

---

## Quick start

### Prerequisites
- **Java 17+** and **Maven** (or use the included `mvnw` wrapper)
- **Node.js 18+** and npm

### 1. Backend

```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

- Runs on `http://localhost:8082`
- **H2 in-memory database** — schema is recreated and reseeded from `src/main/resources/data.sql` on every boot (`ddl-auto=create-drop`, `sql.init.mode=always`). All data is lost on restart.
- H2 console: `http://localhost:8082/h2-console` (JDBC URL `jdbc:h2:mem:locaspace`, user `sa`, password `password`)

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

- Runs on `http://localhost:4200`
- The dev-server proxy (`proxy.conf.json`) forwards `/api/**` and `/uploads/**` to `http://localhost:8082`

### Demo accounts

| Role | Email | Password | Lands on |
|---|---|---|---|
| Tenant | `tenant@example.com` | `Password1!` | `/` (tenant home) |
| Owner | `owner@example.com` | `Password1!` | `/owner/dashboard` |

Other seeded users (`marie@`, `ahmed@`, `fatima@`, `youssef@`, `sara@`, `karim@` `example.com`) use `Password123!`.

---

## Configuration

### Backend (`backend/src/main/resources/application.properties`)

| Property | Value | Notes |
|---|---|---|
| `server.port` | `8082` | API base URL |
| `spring.datasource.url` | `jdbc:h2:mem:locaspace` | In-memory H2; MySQL connector is on the classpath if you switch |
| `spring.jpa.hibernate.ddl-auto` | `create-drop` | Schema rebuilt each boot |
| `spring.sql.init.mode` | `always` | `data.sql` reseeds demo data each boot |
| `jwt.secret` / `jwt.expiration` | dev secret / 24 h | Change for any real deployment |
| `spring.servlet.multipart.max-file-size` | `10MB` | Per-photo upload limit |
| `file.upload-dir` | `uploads` | Photo files stored in `uploads/lieux/{lieuId}/` |

### Frontend
- `src/environments/environment.ts` — `apiBaseUrl` (`http://localhost:8082`)
- `proxy.conf.json` — dev proxy for `/api` and `/uploads`

---

## API surface

All endpoints are prefixed with `/api`. Authentication uses a Bearer JWT (`Authorization: Bearer <token>`); roles are enforced with `@PreAuthorize`.

| Group | Endpoints |
|---|---|
| **Auth** | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `POST /auth/refresh`, `GET /auth/validate` |
| **Lieux** | `GET /lieux`, `GET /lieux/search`, `GET /lieux/{id}`, `GET /lieux/my`, `GET /lieux/{id}/availability`, `POST /lieux` (create), `PUT /lieux/{id}`, `DELETE /lieux/{id}` |
| **Lieu photos** | `POST /lieux/{id}/photos` (multipart, field `photos`), `PUT /lieux/{id}/photos/order`, `DELETE /lieux/{id}/photos?url=` |
| **Calendar** | `GET /lieux/properties/{id}/calendar`, `POST /lieux/properties/{id}/calendar/block`, `DELETE /lieux/calendar/events/{eventId}` |
| **Reviews** | `GET /lieux/{lieuId}/avis`, `POST /lieux/{lieuId}/avis`, `GET /users/me/avis`, `PUT /avis/{avisId}`, `DELETE /avis/{avisId}`, `GET /lieux/{lieuId}/stats` |
| **Reservations** | `POST /reservations`, `GET /reservations/my`, `GET /reservations/owner`, `DELETE /reservations/{id}/cancel`, `PUT /reservations/{id}/status` |
| **Favorites** | `GET /favorites`, `GET /favorites/ids`, `POST /favorites/{lieuId}`, `DELETE /favorites/{lieuId}` |
| **Notifications** | `GET /notifications`, `GET /notifications/unread/count`, `PUT /notifications/{id}/read`, `PUT /notifications/read-all` |
| **Users** | `GET/PUT/DELETE /users/me`, `GET /users/me/reservations` |
| **Dashboard** | `GET /owner/dashboard` (owner stats) |

Error responses follow a consistent shape: validation failures return field-level errors (`ValidationErrorResponse`), other errors return `ErrorResponse`; the frontend maps them via `ApiErrorPresenter`.

---

## Domain model

| Entity | Notes |
|---|---|
| `User` | Email + bcrypt password, role `LOCATAIRE` or `PROPRIETAIRE` |
| `Lieu` | Rental property: type (`LieuType`), price, address/city, capacity, amenities, house rules, check-in/out times. Photos are a `@ElementCollection` of URLs (`lieu_photos` table) — the first URL is the cover |
| `Reservation` | Date range (validated with `@ValidDateRange`), status (`ReservationStatus`), links tenant ↔ lieu |
| `Avis` | Review: 1–5 note + comment, one per tenant per place |
| `Favorite` | Tenant ↔ lieu bookmark |
| `Notification` | Per-user notifications with read state |
| `CalendarEvent` | Owner-managed availability blocks on a lieu's calendar |

### Photo handling
- **Uploaded files**: stored on disk at `uploads/lieux/{lieuId}/{timestamp}-{uuid}.{ext}` by `PhotoStorageService`; served as static content under `/uploads/**` (configured in `WebMvcConfig`). The stored **public URL** (e.g. `/uploads/lieux/12/…`) is pushed into the lieu's photo list.
- **Photo URLs** (e.g. Unsplash links) are stored as-is in the same list.
- The backend **replaces the whole photo list** on `PUT /lieux/{id}`, so clients must send the current list with updates.

---

## Project structure

```
backend/src/main/java/org/example/locaspace/
├── controller/      # REST controllers (Auth, Lieu, Reservation, Avis, Favorite,
│                    #   Notification, User, Dashboard, Health)
├── service/         # Business logic (Lieu, Reservation, Avis, Calendar, Dashboard,
│                    #   Favorite, Notification, User, PhotoStorage)
├── repository/      # Spring Data JPA + JPA Specifications (LieuSpecifications)
├── model/           # JPA entities + enums (Role, LieuType, ReservationStatus)
├── dto/             # Request/response DTOs per domain (auth, lieu, reservation, avis, …)
├── mapper/          # EntityMapper: entity ↔ DTO conversion
├── security/        # JWT filter, JwtUtils, SecurityConfig, UserDetailsService
├── exception/       # Domain exceptions + GlobalExceptionHandler
├── validation/      # Custom validators (@ValidDateRange)
└── config/          # WebMvcConfig (static /uploads serving, CORS)

frontend/src/app/
├── core/
│   ├── api/         # One typed service per domain (lieu, reservation, avis, …)
│   │   └── models/  # TypeScript interfaces mirroring the backend DTOs
│   ├── auth/        # AuthService (JWT session), guards, HTTP interceptors
│   └── ui/          # Shared helpers: photoUrl resolver, responsive img directive,
│                    #   formatters, types, toast & notification-badge services
├── shared/          # Reusable UI: header, footer, modal, lightbox, toast, place-card,
│                    #   pagination, skeletons, state blocks, stars, tabs, …
└── features/
    ├── home/  search/  place-detail/  login/  register/  not-found/
    ├── tenant/       # reservations, favorites, reviews, review-form, profile, notifications
    └── owner/        # dashboard, places, place-form (create/edit + photo upload),
                      #   calendar, inbox
```

### Frontend conventions
- **Standalone components** with lazy-loaded routes (`loadComponent`), `ChangeDetectionStrategy.OnPush` everywhere
- **Signals** for state (no NgModules, no NgRx); observables only where RxJS is needed
- Typed services — no `any`, no mock layer; all data comes from the real API
- Backend-relative photo paths (e.g. `/uploads/…`) are resolved to the API origin via the shared `photoUrl()` helper
- Styling: hand-rolled design system in `src/styles/` (`tokens.css` → design tokens, `base.css`, `components.css`, `pages.css`, `responsive.css`)

---

## Testing

```bash
# Frontend unit tests (Karma + Jasmine)
cd frontend && npm test

# Backend
cd backend && ./mvnw test
```

---

## Notes & gotchas

- **Restarting the backend resets all data** (H2 `create-drop` + `data.sql` reseed), including uploaded files' DB rows (files on disk under `backend/uploads/` persist but orphan).
- Uploaded photos referenced by a relative `/uploads/...` URL resolve correctly both through the dev proxy and direct API origin (see `photoUrl()`).
- The seed data uses Unsplash URLs; a dead link shows a styled "Image unavailable" tile rather than breaking the layout.
