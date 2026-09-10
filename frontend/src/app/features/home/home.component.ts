import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LieuService } from '../../core/api/lieu.service';
import { AuthService } from '../../core/auth/auth.service';
import { TYPES } from '../../core/ui/types';
import { money } from '../../core/ui/format';
import { PlaceCardComponent } from '../../shared/place-card/place-card.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { SkeletonCardsComponent } from '../../shared/skeleton/skeleton-cards.component';
import { StateBlockComponent } from '../../shared/state-block/state-block.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImgAttrsDirective } from '../../core/ui/img-attrs.directive';
import { Page, LieuResponse } from '../../core/api/models';

const CAT_TILES: { label: string; type: string; url: string }[] = [
  { label: 'Villas', type: 'villa', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=300&q=60' },
  { label: 'Apartments', type: 'appartement', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=60' },
  { label: 'Houses', type: 'maison', url: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=300&q=60' },
  { label: 'Studios', type: 'studio', url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=300&q=60' },
  { label: 'Lofts', type: 'loft', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=300&q=60' },
  { label: 'Rooms', type: 'chambre', url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=300&q=60' },
  { label: 'Offices', type: 'office', url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=300&q=60' },
  { label: 'Event spaces', type: 'event_space', url: 'https://images.unsplash.com/photo-1521783988139-89397d761dce?auto=format&fit=crop&w=300&q=60' }
];

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PlaceCardComponent,
    PaginationComponent,
    SkeletonCardsComponent,
    StateBlockComponent,
    IconComponent,
    ImgAttrsDirective
  ],
  template: `
    <section class="home-hero" aria-labelledby="hero-h">
      <div class="home-hero__bg" aria-hidden="true">
        <img [appImg]="'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop'" [eager]="true" alt="" />
      </div>
      <div class="container home-hero__inner">
        <p class="kicker home-hero__eyebrow">Stays · Day offices · Event venues</p>
        <h1 id="hero-h">Find a place that feels right.</h1>
        <p>Apartments, villas, day offices and event venues — published directly by their owners, with real availability.</p>
        <form id="hero-search" class="search-bar" role="search" aria-label="Quick search" [formGroup]="searchForm" (ngSubmit)="onSearch()">
          <div class="search-bar__field search-bar__field--kw">
            <label for="hs-kw">Keyword</label>
            <input id="hs-kw" class="search-bar__input" type="search" formControlName="keyword" placeholder="Try &ldquo;riad&rdquo;, &ldquo;loft&rdquo;, &ldquo;office&rdquo;&hellip;" autocomplete="off" />
          </div>
          <div class="search-bar__field">
            <label for="hs-type">Type</label>
            <select id="hs-type" class="search-bar__input" formControlName="type">
              <option value="">Any</option>
              @for (t of types; track t[0]) {
                <option [value]="t[0]">{{ t[1] }}</option>
              }
            </select>
          </div>
          <div class="search-bar__field">
            <label for="hs-city">City</label>
            <input id="hs-city" class="search-bar__input" type="text" formControlName="city" placeholder="Anywhere" autocomplete="off" />
          </div>
          <div class="search-bar__field">
            <label for="hs-max">Max price</label>
            <input id="hs-max" class="search-bar__input" type="number" formControlName="maxPrice" min="10" max="10000" placeholder="Any" inputmode="numeric" />
          </div>
          <button class="btn btn--primary search-bar__submit" type="submit">
            <app-icon name="search" />
            <span>Search</span>
          </button>
        </form>
        <ul class="hero-facts" aria-label="How Sakane works">
          <li><strong id="live-count">{{ totalElements() || '—' }}</strong> places live right now</li>
          <li>Owner-confirmed bookings, no upfront charge</li>
          <li>Reviews only after completed stays</li>
        </ul>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="kicker">Browse</span>
            <h2>By type of place</h2>
          </div>
        </div>
        <nav class="cat-grid" aria-label="Browse by type">
          @for (cat of catTiles; track cat.type) {
            <a class="cat-tile" [routerLink]="['/search']" [queryParams]="{type: cat.type}">
              <figure>
                <img [appImg]="cat.url" alt="" />
              </figure>
              <span>{{ cat.label }}</span>
            </a>
          }
        </nav>

        <div class="section-head mt-7">
          <div>
            <span class="kicker">Live listings</span>
            <h2>Published places</h2>
          </div>
          <a class="btn btn--ghost btn--sm" routerLink="/search">Open full search →</a>
        </div>

        @if (loading()) {
          <app-skeleton-cards [count]="8" />
        } @else if (error()) {
          <app-state-block kind="error" icon="warn" title="Could not load places" [message]="error() ?? ''" (retry)="load()" />
        } @else {
          @if (featured()) {
            <article class="feature-card">
              <div class="feature-card__media">
                <img [appImg]="featured()!.photos![0] || ''" [alt]="featured()!.titre" />
              </div>
              <div class="feature-card__body">
                <h3><a [routerLink]="['/places', featured()!.id]">{{ featured()!.titre }}</a></h3>
                <p class="feature-card__desc">{{ featured()!.description }}</p>
                <div class="feature-card__facts">
                  <span><app-icon name="pin" /> {{ featured()!.city || featured()!.adresse }}</span>
                  <span><app-icon name="home" /> {{ featured()!.type }}</span>
                </div>
                <div class="feature-card__foot">
                  <span class="price">{{ money(featured()!.prix) }} <span>/ night</span></span>
                  <a class="btn btn--primary" [routerLink]="['/places', featured()!.id]">View details</a>
                </div>
              </div>
            </article>
          }

          <div class="place-grid">
            @for (place of gridPlaces(); track place.id) {
              <app-place-card [lieu]="place" />
            }
          </div>

          <app-pagination [page]="paginationInfo()" (pageChange)="onPageChange($event)" />
        }

        @if (ownerCta() === 'guest') {
          <section class="owner-cta" aria-label="For owners">
            <div><h2>Have a place to rent?</h2>
            <p>Publishing on Sakane is immediate — no approval queue. Manage requests, availability and photos from one dashboard.</p></div>
            <a class="btn btn--primary" routerLink="/register" [queryParams]="{ role: 'owner' }">Create an owner account</a>
          </section>
        } @else if (ownerCta() === 'owner') {
          <section class="owner-cta" aria-label="For owners">
            <div><h2>Ready to list another place?</h2>
            <p>New places are published immediately and start taking requests right away.</p></div>
            <a class="btn btn--primary" routerLink="/owner/places/new"><app-icon name="plus" /> New place</a>
          </section>
        }
      </div>
    </section>
  `
})
export class HomeComponent {
  private lieuService = inject(LieuService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  readonly types = TYPES;
  readonly catTiles = CAT_TILES;
  readonly money = money;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly page = signal<Page<LieuResponse> | null>(null);
  readonly pageNum = signal(0);

  readonly totalElements = computed(() => this.page()?.totalElements ?? 0);
  readonly paginationInfo = computed(() => {
    const p = this.page();
    return p ? { number: p.number, totalPages: p.totalPages, totalElements: p.totalElements, first: p.first, last: p.last } : null;
  });
  readonly featured = computed<LieuResponse | null>(() => {
    const p = this.page();
    if (!p || p.number !== 0 || p.content.length === 0) return null;
    return p.content[0];
  });
  readonly gridPlaces = computed(() => {
    const p = this.page();
    if (!p) return [];
    const items = p.number === 0 ? p.content.slice(1) : p.content;
    return items;
  });
  /** Prototype rule (pages-public.js): guests see a sign-up CTA, owners see a
   *  "list another place" CTA, tenants see nothing. */
  readonly ownerCta = computed<'guest' | 'owner' | null>(() => {
    if (!this.auth.isAuthenticated()) return 'guest';
    return this.auth.role() === 'PROPRIETAIRE' ? 'owner' : null;
  });

  readonly searchForm = this.fb.group({
    keyword: [''],
    type: [''],
    city: [''],
    maxPrice: [null as number | null]
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.lieuService.list(this.pageNum()).subscribe({
      next: (p) => { this.page.set(p); this.loading.set(false); },
      error: (e) => { this.error.set(e.message ?? 'Could not load places.'); this.loading.set(false); }
    });
  }

  onPageChange(p: number): void {
    this.pageNum.set(p);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(): void {
    const v = this.searchForm.value;
    const params: Record<string, string | number> = {};
    if (v.keyword) params['keyword'] = v.keyword;
    if (v.type) params['type'] = v.type;
    if (v.city) params['city'] = v.city;
    if (v.maxPrice) params['maxPrice'] = v.maxPrice;
    this.router.navigate(['/search'], { queryParams: params });
  }
}
