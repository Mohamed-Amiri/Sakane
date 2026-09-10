import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap, of, catchError, forkJoin, map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { LieuService } from '../../core/api/lieu.service';
import { AvisService } from '../../core/api/avis.service';
import { FavoriteService } from '../../core/api/favorite.service';
import { ReservationService } from '../../core/api/reservation.service';
import { LieuResponse, AvisResponse, AvailabilityResponse, ReservationResponse } from '../../core/api/models';
import { ApiErrorPresenter } from '../../core/api/api-error-presenter';
import { prettyType, LABEL_TO_CODE } from '../../core/ui/types';
import { money, fmtRange, initials, plural, todayIso, addDays } from '../../core/ui/format';
import { IconComponent } from '../../shared/icon/icon.component';
import { StarsComponent } from '../../shared/stars/stars.component';
import { RatingComponent } from '../../shared/rating/rating.component';
import { FactChipComponent } from '../../shared/fact-chip/fact-chip.component';
import { StateBlockComponent } from '../../shared/state-block/state-block.component';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { LightboxService } from '../../shared/lightbox/lightbox.service';
import { ModalService } from '../../shared/modal/modal.service';
import { ImgAttrsDirective } from '../../core/ui/img-attrs.directive';

interface BookingCost {
  nights: number;
  total: number;
}

@Component({
  selector: 'app-place-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormsModule,
    IconComponent,
    StarsComponent,
    RatingComponent,
    FactChipComponent,
    StateBlockComponent,
    ImgAttrsDirective
  ],
  template: `
    <section class="container page-section">
      @if (error()) {
        <app-state-block
          kind="error"
          icon="warn"
          [title]="error()!.title"
          [message]="error()!.message"
        >
          <a class="btn btn--primary" routerLink="/">Back to explore</a>
        </app-state-block>
      } @else if (lieu()) {
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/">Explore</a>
          <span class="breadcrumb__sep" aria-hidden="true">/</span>
          <a [routerLink]="['/search']" [queryParams]="{ type: typeCode() }">{{ prettyType(lieu()!.type) }}s</a>
          @if (lieu()!.city) {
            <span class="breadcrumb__sep" aria-hidden="true">/</span>
            <span aria-current="page">{{ lieu()!.city }}</span>
          }
        </nav>

        <div class="gallery-wrap">
          <div class="detail-gallery" [class.detail-gallery--single]="photos().length <= 1" [class.detail-gallery--two]="photos().length === 2">
            @for (photo of galleryPhotos(); track photo; let i = $index) {
              <figure>
                <img [appImg]="photo" [alt]="lieu()!.titre + ' — photo ' + (i + 1)" [sizes]="gallerySizes(i)" [widths]="[480, 800, 1200, 1600]" [eager]="i === 0" />
                <button class="gallery-tile-btn" type="button" [attr.aria-label]="'Open photo ' + (i + 1) + ' of ' + photos().length" (click)="openLightbox(i)"></button>
              </figure>
            }
            @if (!photos().length) {
              <figure class="detail-gallery__empty">
                <app-icon name="images" />
                <span>No photos yet</span>
              </figure>
            }
          </div>
          @if (photos().length > 1) {
            <button class="gallery-open" type="button" (click)="openLightbox(0)">
              <app-icon name="images" />
              Show all {{ plural(photos().length, 'photo') }}
            </button>
          }
        </div>

        <div class="detail-layout">
          <div>
            <div class="detail-title-row">
              <div>
                <span class="kicker">{{ prettyType(lieu()!.type) }}{{ lieu()!.neighborhood ? ' · ' + lieu()!.neighborhood : lieu()!.city ? ' · ' + lieu()!.city : '' }}</span>
                <h1>{{ lieu()!.titre }}</h1>
                <p class="text-secondary loc-line">
                  <app-icon name="pin" />
                  {{ lieu()!.adresse }}
                </p>
              </div>
              @if (isAuthenticated()) {
                <button class="btn btn--secondary fav-btn--inline" type="button" [disabled]="favDisabled()" [attr.aria-pressed]="isFavorite() ? 'true' : 'false'" [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Save to favorites'" (click)="onToggleFav()">
                  <app-icon [name]="isFavorite() ? 'heart-fill' : 'heart'" />
                  <span>{{ isFavorite() ? 'Saved' : 'Save' }}</span>
                </button>
              }
            </div>

            @if (factChips().length) {
              <div class="fact-chips">
                @for (chip of factChips(); track chip) {
                  <app-fact-chip [icon]="chip.icon">
                    <span [innerHTML]="chip.html"></span>
                  </app-fact-chip>
                }
              </div>
            }

            <section class="detail-section" aria-labelledby="about-h">
              <h2 id="about-h">About this place</h2>
              <p class="detail-desc">{{ lieu()!.description }}</p>
            </section>

            @if (lieu()!.amenities!.length) {
              <section class="detail-section" aria-labelledby="amen-h">
                <h2 id="amen-h">Amenities</h2>
                <ul class="amenity-list">
                  @for (a of lieu()!.amenities; track a) {
                    <li><app-icon name="check" /> {{ a }}</li>
                  }
                </ul>
              </section>
            }

            @if (lieu()!.houseRules) {
              <section class="detail-section" aria-labelledby="rules-h">
                <h2 id="rules-h">House rules</h2>
                <p class="detail-desc">{{ lieu()!.houseRules }}</p>
              </section>
            }

            @if (lieu()!.owner) {
              <div class="owner-line mt-6">
                <span class="avatar" aria-hidden="true">{{ initials(lieu()!.owner!.nom) }}</span>
                <div>
                  <strong>Hosted by {{ lieu()!.owner!.nom }}</strong>
                  <br />
                  <span class="text-sm text-secondary">Owner on Sakane · confirms every request personally</span>
                </div>
              </div>
            }

            <section class="detail-section" aria-labelledby="reviews-h">
              <h2 id="reviews-h">Reviews</h2>
              @if (reviewSummary().count) {
                <div class="review-summary">
                  <span class="review-summary__score">{{ reviewSummary().avg!.toFixed(1) }}</span>
                  <div>
                    <app-stars [note]="reviewSummary().avg!" />
                    <br />
                    <span class="text-sm text-secondary">{{ plural(reviewSummary().count!, 'review') }}</span>
                  </div>
                </div>
              }
              <div id="reviews-list">
                @if (reviewsLoading()) {
                  <div class="skeleton skeleton--row"></div>
                } @else if (reviews().length === 0) {
                  <p class="text-secondary">No reviews yet for this place.</p>
                } @else {
                  @for (a of reviews(); track a.id) {
                    <article class="review">
                      <div class="review__head">
                        <span class="avatar" aria-hidden="true">{{ initials(a.auteurNom) }}</span>
                        <div>
                          <strong>{{ a.auteurNom }}</strong>
                          <br />
                          <app-stars [note]="a.note" />
                        </div>
                      </div>
                      <p class="text-secondary">{{ a.commentaire }}</p>
                    </article>
                  }
                }
              </div>
            </section>
          </div>

          <aside>
            <div class="booking-panel">
              @if (!isAuthenticated()) {
                <div class="booking-panel__price">
                  <span class="price">{{ money(lieu()!.prix) }}</span>
                  <span class="text-secondary">/ night</span>
                  @if (lieu()!.averageRating != null) {
                    <span class="booking-panel__rating">
                      <app-rating [average]="lieu()!.averageRating" [count]="lieu()!.reviewCount" />
                    </span>
                  }
                </div>
                <p class="text-secondary text-sm">Log in to check availability and request a booking. The owner confirms every request — you are never charged upfront.</p>
                <a class="btn btn--primary btn--block" [routerLink]="['/login']" [queryParams]="{ redirect: 'place.html?id=' + lieu()!.id }">Log in to book</a>
                <p class="booking-panel__fine">New here? <a routerLink="/register">Create an account</a></p>
              } @else if (!isTenant()) {
                <div class="booking-panel__price">
                  <span class="price">{{ money(lieu()!.prix) }}</span>
                  <span class="text-secondary">/ night</span>
                  @if (lieu()!.averageRating != null) {
                    <span class="booking-panel__rating">
                      <app-rating [average]="lieu()!.averageRating" [count]="lieu()!.reviewCount" />
                    </span>
                  }
                </div>
                <div class="alert alert--info">
                  <div><strong>Owner account</strong>Booking is designed for tenant accounts. Manage your own places from the dashboard.</div>
                </div>
              } @else {
                <div class="booking-panel__price">
                  <span class="price">{{ money(lieu()!.prix) }}</span>
                  <span class="text-secondary">/ night</span>
                  @if (lieu()!.averageRating != null) {
                    <span class="booking-panel__rating">
                      <app-rating [average]="lieu()!.averageRating" [count]="lieu()!.reviewCount" />
                    </span>
                  }
                </div>
                <form id="booking-form" (ngSubmit)="onSubmitBooking()" novalidate>
                  <div class="date-pair" [class.date-pair--invalid]="noteKind() === 'bad'">
                    <div class="date-pair__cell">
                      <label for="bk-start">Check-in</label>
                      <input type="date" id="bk-start" name="startDate" [min]="todayIso()" [(ngModel)]="startDate" (change)="checkDates()" required />
                    </div>
                    <div class="date-pair__cell">
                      <label for="bk-end">Check-out</label>
                      <input type="date" id="bk-end" name="endDate" [min]="minEnd()" [(ngModel)]="endDate" (change)="checkDates()" required />
                    </div>
                  </div>
                  <div id="availability-note" class="booking-note" [class.booking-note--ok]="noteKind() === 'ok'" [class.booking-note--bad]="noteKind() === 'bad'" role="status" aria-live="polite">
                    @if (noteKind() === 'ok') {
                      <app-icon name="check" />
                    }
                    @if (noteKind() === 'bad') {
                      <app-icon name="warn" />
                    }
                    @if (checkingAvailability()) {
                      <span class="spinner spinner--xs" aria-hidden="true"></span>
                      <span>Checking availability…</span>
                    } @else if (noteText()) {
                      <span>{{ noteText() }}</span>
                    }
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="bk-guests">Guests @if (lieu()!.maxGuests) { <span class="optional">(max {{ lieu()!.maxGuests }})</span> }</label>
                    <input class="input" type="number" id="bk-guests" name="guests" min="1" [max]="lieu()!.maxGuests ?? null" [(ngModel)]="guests" inputmode="numeric" />
                    @if (guestsError()) {
                      <p class="field-error">{{ guestsError() }}</p>
                    }
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="bk-req">Special requests <span class="optional">(optional)</span></label>
                    <textarea class="textarea" id="bk-req" name="specialRequests" maxlength="1000" rows="2" placeholder="Anything the owner should know?" [(ngModel)]="specialRequests"></textarea>
                  </div>
                  @if (bookingCost(); as cost) {
                    <div class="cost-lines">
                      <div><span>{{ money(lieu()!.prix) }} × {{ plural(cost.nights, 'night') }}</span><span>{{ money(cost.total) }}</span></div>
                      <div class="cost-total"><span>Total</span><span>{{ money(cost.total) }}</span></div>
                    </div>
                  }
                  <button class="btn btn--primary btn--block btn--lg" type="submit" [disabled]="bookingLoading()">
                    @if (bookingLoading()) {
                      <span class="spinner" aria-hidden="true"></span><span>Requesting…</span>
                    } @else {
                      <span>Request to book</span>
                    }
                  </button>
                  <p class="booking-panel__fine">You won't be charged — the owner confirms first.</p>
                </form>
              }
            </div>
          </aside>
        </div>
      }
    </section>
  `
})
export class PlaceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private lieuService = inject(LieuService);
  private avisService = inject(AvisService);
  private favoriteService = inject(FavoriteService);
  private reservationService = inject(ReservationService);
  private errPresenter = inject(ApiErrorPresenter);
  private lightbox = inject(LightboxService);
  private modal = inject(ModalService);

  readonly isAuthenticated = computed(() => this.auth.isAuthenticated());
  readonly isTenant = computed(() => this.auth.role() === 'LOCATAIRE');

  readonly lieu = signal<LieuResponse | null>(null);
  readonly error = signal<{ title: string; message: string } | null>(null);
  readonly reviews = signal<AvisResponse[]>([]);
  readonly reviewsLoading = signal(false);
  readonly isFavorite = signal(false);
  readonly favDisabled = signal(true);
  readonly favoriteIds = signal<number[]>([]);

  readonly photos = computed(() => this.lieu()?.photos ?? []);

  readonly galleryPhotos = computed(() => {
    const p = this.photos();
    return p.length ? p.slice(0, 3) : [];
  });

  readonly typeCode = computed(() => {
    const l = this.lieu();
    if (!l) return '';
    return LABEL_TO_CODE[l.type] || '';
  });

  readonly reviewSummary = computed(() => {
    const l = this.lieu();
    const reviews = this.reviews();
    // Use stats-based average if auth-refined, otherwise fall back to lieu.averageRating
    if (reviews.length > 0) {
      const avg = reviews.reduce((s, a) => s + a.note, 0) / reviews.length;
      return { avg, count: reviews.length };
    }
    if (l?.averageRating != null) {
      return { avg: l.averageRating, count: l.reviewCount ?? 0 };
    }
    return { avg: null as number | null, count: 0 };
  });

  readonly factChips = computed(() => {
    const l = this.lieu();
    if (!l) return [];
    const chips: Array<{ icon: 'users' | 'bed' | 'bath' | 'calendar' | 'clock'; html: string }> = [];
    if (l.maxGuests != null) {
      chips.push({ icon: 'users', html: `<strong>${l.maxGuests}</strong> guests` });
    }
    if (l.bedrooms != null) {
      chips.push({ icon: 'bed', html: `<strong>${l.bedrooms}</strong> ${l.bedrooms === 1 ? 'bedroom' : 'bedrooms'}` });
    }
    if (l.bathrooms != null) {
      chips.push({ icon: 'bath', html: `<strong>${l.bathrooms}</strong> ${l.bathrooms === 1 ? 'bathroom' : 'bathrooms'}` });
    }
    if (l.minimumNights != null) {
      chips.push({ icon: 'calendar', html: `min <strong>${l.minimumNights}</strong> ${l.minimumNights === 1 ? 'night' : 'nights'}` });
    }
    if (l.checkInTime) {
      chips.push({ icon: 'clock', html: `check-in <strong>${this.escapeHtml(l.checkInTime)}</strong>` });
    }
    if (l.checkOutTime) {
      chips.push({ icon: 'clock', html: `check-out <strong>${this.escapeHtml(l.checkOutTime)}</strong>` });
    }
    return chips;
  });

  readonly prettyType = prettyType;
  readonly plural = plural;
  readonly initials = initials;
  readonly money = money;

  // Booking panel state
  startDate = '';
  endDate = '';
  guests: number | null = null;
  specialRequests = '';
  bookingLoading = signal(false);
  checkingAvailability = signal(false);
  noteKind = signal<'ok' | 'bad' | null>(null);
  noteText = signal('');
  guestsError = signal('');
  bookingCost = signal<BookingCost | null>(null);
  private checkSeq = 0;

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!id) {
          this.router.navigate(['/not-found']);
          return of(undefined);
        }
        return this.loadPlace(id);
      })
    ).subscribe();
  }

  private loadPlace(id: number) {
    const auth = this.auth.isAuthenticated();

    const lieu$ = this.lieuService.get(id).pipe(
      catchError((e: any) => {
        if (e.status === 404) {
          this.error.set({
            title: 'Place not found',
            message: 'This place does not exist or is no longer published.'
          });
        } else {
          this.error.set({
            title: 'Cannot load this place',
            message: 'Something went wrong while loading this place.'
          });
        }
        return of(null);
      })
    );

    const fav$ = auth
      ? this.favoriteService.ids().pipe(catchError(() => of<number[]>([])))
      : of<number[]>([]);

    const stats$ = auth
      ? this.lieuService.getStats(id).pipe(catchError(() => of(null)))
      : of(null);

    const reviews$ = this.avisService.forLieu(id).pipe(
      catchError(() => of([]))
    );

    return forkJoin([lieu$, fav$, stats$, reviews$]).pipe(
      map(([lieu, favIds, stats, avis]) => {
        if (!lieu) return;
        this.lieu.set(lieu);
        this.favoriteIds.set(favIds);

        if (auth) {
          this.isFavorite.set(favIds.includes(lieu.id));
          this.favDisabled.set(false);
        }

        this.reviews.set(avis);
        this.reviewsLoading.set(false);

        const today = todayIso();
        const minEnd = addDays(today, Math.max(1, lieu.minimumNights || 1));
        this.startDate = '';
        this.endDate = '';
        this.guests = lieu.maxGuests ? Math.min(2, lieu.maxGuests) : 2;

        if (stats) {
          // stats refines averageRating/reviewCount — already reflected in reviews() if any
        }

        document.title = `${lieu.titre} — Sakane`;
      })
    );
  }

  gallerySizes(i: number): string {
    return i === 0 ? '(max-width: 640px) 88vw, 66vw' : '(max-width: 640px) 88vw, 33vw';
  }

  openLightbox(index: number): void {
    this.lightbox.open(this.photos(), index, this.lieu()!.titre);
  }

  onToggleFav(): void {
    if (this.favDisabled()) return;
    const l = this.lieu();
    if (!l) return;
    const currentlyFav = this.isFavorite();

    // Optimistic update
    this.isFavorite.set(!currentlyFav);

    const call = currentlyFav
      ? this.favoriteService.remove(l.id)
      : this.favoriteService.add(l.id);

    call.subscribe({
      next: () => {
        // Update the ids list
        const ids = this.favoriteIds();
        if (currentlyFav) {
          this.favoriteIds.set(ids.filter(x => x !== l.id));
        } else {
          this.favoriteIds.set([...ids, l.id]);
        }
      },
      error: () => {
        // Revert on failure
        this.isFavorite.set(currentlyFav);
      }
    });
  }

  todayIso(): string {
    return todayIso();
  }

  minEnd(): string {
    const l = this.lieu();
    if (!l || !this.startDate) return todayIso();
    return addDays(this.startDate, Math.max(1, l.minimumNights || 1));
  }

  checkDates(): void {
    const l = this.lieu();
    if (!l) return;

    this.bookingCost.set(null);
    this.noteKind.set(null);
    this.noteText.set('');

    if (this.startDate && this.endDate) {
      // Update min end date
      const minEnd = addDays(this.startDate, Math.max(1, l.minimumNights || 1));
      // We can't directly set the min attribute reactively, but the template binds to minEnd()
    }

    if (!this.startDate || !this.endDate) return;

    if (this.endDate <= this.startDate) {
      this.noteKind.set('bad');
      this.noteText.set('Check-out must be after check-in.');
      return;
    }

    const nights = Math.round((new Date(this.endDate).getTime() - new Date(this.startDate).getTime()) / 86400000);
    if (l.minimumNights && nights < l.minimumNights) {
      this.noteKind.set('bad');
      this.noteText.set(`This place requires a minimum of ${plural(l.minimumNights, 'night')}.`);
      return;
    }

    const seq = ++this.checkSeq;
    this.checkingAvailability.set(true);
    this.lieuService.getAvailability(l.id, this.startDate, this.endDate).subscribe({
      next: (availability) => {
        if (seq !== this.checkSeq) return;
        this.checkingAvailability.set(false);
        if (availability.bookedRanges.length > 0) {
          this.noteKind.set('bad');
          this.noteText.set(
            'Some of those dates are unavailable (' +
              availability.bookedRanges
                .map(r => fmtRange(r.start, r.end) + (r.reason === 'blocked' ? ' blocked' : ' booked'))
                .join(', ') +
              '). Pick different dates.'
          );
          return;
        }
        this.noteKind.set('ok');
        this.noteText.set(`${plural(nights, 'night')} available`);
        this.bookingCost.set({ nights, total: l.prix * nights });
      },
      error: (e) => {
        if (seq !== this.checkSeq) return;
        this.checkingAvailability.set(false);
        this.noteKind.set('bad');
        this.noteText.set('Availability could not be checked right now.');
      }
    });
  }

  onSubmitBooking(): void {
    const l = this.lieu();
    if (!l) return;

    this.guestsError.set('');

    if (!this.startDate || !this.endDate) {
      this.noteKind.set('bad');
      this.noteText.set('Pick your check-in and check-out dates first.');
      return;
    }

    if (this.endDate <= this.startDate) {
      this.noteKind.set('bad');
      this.noteText.set('Check-out must be after check-in.');
      return;
    }

    const g = Number(this.guests);
    if (l.maxGuests && g > l.maxGuests) {
      this.guestsError.set(`This place hosts up to ${plural(l.maxGuests, 'guest')}.`);
      return;
    }

    if (g < 1) {
      this.guestsError.set('At least one guest.');
      return;
    }

    const doSubmit = () => {
      this.bookingLoading.set(true);
      this.reservationService
        .create({
          placeId: l.id,
          startDate: this.startDate,
          endDate: this.endDate,
          guests: g || undefined,
          specialRequests: this.specialRequests.trim() || undefined
        })
        .subscribe({
          next: (res) => {
            this.bookingLoading.set(false);
            this.showSuccessModal(res);
            this.formReset();
          },
          error: (e) => {
            this.bookingLoading.set(false);
            if (e.status === 409) {
              this.noteKind.set('bad');
              this.noteText.set('Those dates were just taken. Please pick new dates.');
              this.checkDates();
            } else if (e.status === 400) {
              this.noteKind.set('bad');
              this.noteText.set('Could not create the reservation. Check the dates and try again.');
            } else {
              this.noteKind.set('bad');
              this.noteText.set(this.errPresenter.apiErrorMessage(e, { generic: 'Could not create the reservation.' }));
            }
          }
        });
    };

    if (this.noteKind() !== 'ok') {
      this.checkDates();
      // After checkDates completes, if ok, submit
      // For simplicity, check after a brief re-evaluation
      const checkAndSubmit = () => {
        if (this.checkingAvailability()) {
          setTimeout(checkAndSubmit, 50);
          return;
        }
        if (this.noteKind() === 'ok') {
          doSubmit();
        }
      };
      checkAndSubmit();
      return;
    }

    doSubmit();
  }

  private showSuccessModal(res: ReservationResponse): void {
    this.modal.open(SuccessModalComponent, { title: 'Request sent' }, {
      lieu: this.lieu()!,
      reservation: res
    });
  }

  private formReset(): void {
    const l = this.lieu();
    this.startDate = '';
    this.endDate = '';
    this.guests = l?.maxGuests ? Math.min(2, l.maxGuests) : 2;
    this.specialRequests = '';
    this.bookingCost.set(null);
    this.noteKind.set(null);
    this.noteText.set('');
  }

  escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

// Inline success modal component — ported from prototype's openModal with bodyHtml + actions
@Component({
  selector: 'app-booking-success-modal',
  standalone: true,
  imports: [IconComponent, StatusBadgeComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="alert alert--success mb-3">
      <div><strong>Your booking request is pending</strong>The owner has been notified and will confirm or refuse it. You'll see the outcome in your notifications.</div>
    </div>
    <p>
      <strong>{{ lieu.titre }}</strong><br />
      {{ fmtRange(reservation.dateDebut, reservation.dateFin) }} · {{ plural(reservation.totalNights, 'night') }} · {{ money(reservation.totalPrice) }}
    </p>
    <p>Status: <app-status-badge [status]="reservation.statut" /></p>
    <div class="modal__actions">
      <button class="btn btn--secondary" type="button" (click)="onKeepExploring()">Keep exploring</button>
      <a class="btn btn--primary" routerLink="/reservations" (click)="onViewTrips()">View my trips</a>
    </div>
  `
})
export class SuccessModalComponent {
  private modal = inject(ModalService);

  @Input({ required: true }) lieu!: LieuResponse;
  @Input({ required: true }) reservation!: ReservationResponse;

  readonly money = money;
  readonly fmtRange = fmtRange;
  readonly plural = plural;

  onKeepExploring(): void {
    this.modal.close();
  }

  onViewTrips(): void {
    this.modal.close();
  }
}
