import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LieuService } from '../../core/api/lieu.service';
import { TYPES, CODE_TO_LABEL } from '../../core/ui/types';
import { money, plural } from '../../core/ui/format';
import { PlaceCardComponent } from '../../shared/place-card/place-card.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { SkeletonCardsComponent } from '../../shared/skeleton/skeleton-cards.component';
import { StateBlockComponent } from '../../shared/state-block/state-block.component';
import { Page, LieuResponse } from '../../core/api/models';
import { SearchLieuxParams } from '../../core/api/lieu.service';

@Component({
  selector: 'app-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PlaceCardComponent,
    SkeletonCardsComponent,
    StateBlockComponent,
    PaginationComponent
  ],
  template: `
    <section class="container page-section">
      <button class="btn btn--secondary filters-toggle" id="filters-toggle" type="button"
        [attr.aria-expanded]="filtersOpen()" aria-controls="filters-panel" (click)="filtersOpen.set(!filtersOpen())">
        <span>{{ filtersOpen() ? 'Hide filters' : 'Show filters' }}</span>
      </button>
      <div class="search-layout">
        <aside class="filters-panel" id="filters-panel" aria-label="Filters" [class.is-open]="filtersOpen()">
          <div class="card card--pad">
            <h2 class="card-title mb-4">Filters</h2>
            <form class="form" id="filter-form" [formGroup]="form" (ngSubmit)="run(0)" novalidate>
              <div class="form-field">
                <label class="form-label" for="f-kw">Keyword</label>
                <input class="input" id="f-kw" type="search" placeholder="Title, description, address…" formControlName="keyword" />
              </div>
              <p id="keyword-note" class="alert alert--info alert--compact mb-4" [hidden]="!hasKeywordAndOtherFilters()">
                Keyword search ignores the other filters — the backend applies the keyword only.
              </p>
              <div class="form-field">
                <label class="form-label" for="f-type">Type</label>
                <select class="select" id="f-type" formControlName="type">
                  <option value="">Any type</option>
                  @for (t of types; track t[0]) {
                    <option [value]="t[0]">{{ t[1] }}</option>
                  }
                </select>
              </div>
              <div class="form-grid">
                <div class="form-field">
                  <label class="form-label" for="f-min">Min price</label>
                  <input class="input" id="f-min" type="number" min="10" max="10000" placeholder="10" inputmode="numeric" formControlName="minPrice" />
                </div>
                <div class="form-field">
                  <label class="form-label" for="f-max">Max price</label>
                  <input class="input" id="f-max" type="number" min="10" max="10000" placeholder="10000" inputmode="numeric" formControlName="maxPrice" />
                </div>
              </div>
              <div class="form-field">
                <label class="form-label" for="f-city">City</label>
                <input class="input" id="f-city" type="text" placeholder="e.g. Rabat" formControlName="city" />
                <p class="form-hint">Matches against the address.</p>
              </div>
              <div class="cluster">
                <button class="btn btn--primary" type="submit">Apply filters</button>
                <button class="btn btn--ghost" type="button" id="clear-filters" (click)="clearAll()">Clear</button>
              </div>
            </form>
          </div>
        </aside>
        <section aria-label="Search results">
          <div class="results-head">
            <h1>Search places</h1>
            <span class="results-count" id="results-count" aria-live="polite">{{ resultsCount() }}</span>
          </div>
          <div class="filter-chiprow" id="filter-chips">
            @for (chip of chips(); track chip.key) {
              <span class="chip">
                {{ chip.label }}
                <button type="button" [attr.aria-label]="'Remove filter ' + chip.label" (click)="removeFilter(chip.key)">✕</button>
              </span>
            }
          </div>

          @if (loading()) {
            <app-skeleton-cards [count]="6" />
          } @else if (error()) {
            <app-state-block kind="error" icon="warn" title="Search failed" [message]="error() ?? ''" (retry)="run(pageNum())" />
          } @else if (results()) {
            @if (results()!.empty) {
              <app-state-block icon="search" title="No places match" message="Try removing a filter, widening the price range, or searching a different city.">
                <button class="btn btn--secondary" type="button" (click)="clearAll()">Clear all filters</button>
              </app-state-block>
            } @else {
              <div class="place-grid" id="results-grid">
                @for (place of results()!.content; track place.id) {
                  <app-place-card [lieu]="place" />
                }
              </div>
              <app-pagination [page]="paginationInfo()" (pageChange)="onPageChange($event)" />
            }
          }
        </section>
      </div>
    </section>
  `
})
export class SearchComponent implements OnInit {
  private lieuService = inject(LieuService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  readonly types = TYPES;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly results = signal<Page<LieuResponse> | null>(null);
  readonly pageNum = signal(0);
  readonly filtersOpen = signal(false);

  private reqSeq = 0;

  readonly form = this.fb.group({
    keyword: [''],
    type: [''],
    minPrice: [null as number | null],
    maxPrice: [null as number | null],
    city: ['']
  });

  readonly paginationInfo = computed(() => {
    const r = this.results();
    return r ? { number: r.number, totalPages: r.totalPages, totalElements: r.totalElements, first: r.first, last: r.last } : null;
  });

  readonly resultsCount = computed(() => {
    const r = this.results();
    if (r === null) return '';
    return plural(r.totalElements, 'place found', 'places found');
  });

  readonly hasKeywordAndOtherFilters = computed(() => {
    const f = this.form.value;
    if (!f.keyword?.trim()) return false;
    return !!(f.type || f.minPrice || f.maxPrice || f.city?.trim());
  });

  readonly chips = computed<Array<{key: string; label: string}>>(() => {
    const f = this.form.value;
    const items: Array<{key: string; label: string}> = [];
    if (f.keyword?.trim()) {
      items.push({ key: 'keyword', label: `“${f.keyword.trim()}”` });
      return items;
    }
    if (f.type) {
      const label = CODE_TO_LABEL[f.type] || f.type;
      items.push({ key: 'type', label });
    }
    if (f.minPrice) items.push({ key: 'minPrice', label: `from ${money(Number(f.minPrice))}` });
    if (f.maxPrice) items.push({ key: 'maxPrice', label: `up to ${money(Number(f.maxPrice))}` });
    if (f.city?.trim()) items.push({ key: 'city', label: f.city.trim() });
    return items;
  });

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.form.patchValue({
      keyword: params.get('keyword') ?? '',
      type: params.get('type') ?? '',
      minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : null,
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : null,
      city: params.get('city') ?? ''
    });
    const startPage = Math.max(0, Number(params.get('page') || 0));
    this.pageNum.set(startPage);
    this.run(startPage);
  }

  run(pageNo: number): void {
    const seq = ++this.reqSeq;
    const v = this.form.value;
    const criteria: SearchLieuxParams = {
      keyword: v.keyword?.trim() || undefined,
      type: v.type || undefined,
      minPrice: v.minPrice ?? undefined,
      maxPrice: v.maxPrice ?? undefined,
      city: v.city?.trim() || undefined,
      page: pageNo,
      size: 12
    };
    this.updateUrl(criteria, pageNo);
    this.loading.set(true);
    this.error.set(null);
    this.lieuService.search(criteria).subscribe({
      next: (data) => {
        if (seq !== this.reqSeq) return;
        this.results.set(data);
        this.pageNum.set(pageNo);
        this.loading.set(false);
        document.title = (criteria.keyword ? `“${criteria.keyword}” — ` : '') + 'Search places — Sakane';
      },
      error: (e) => {
        if (seq !== this.reqSeq) return;
        this.error.set(e.message ?? 'Search failed.');
        this.loading.set(false);
      }
    });
  }

  onPageChange(p: number): void {
    this.run(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  removeFilter(key: string): void {
    this.form.patchValue({ [key]: '' });
    this.run(0);
  }

  clearAll(): void {
    this.form.reset();
    this.run(0);
  }

  private updateUrl(c: SearchLieuxParams, page: number): void {
    const params: Record<string, string> = {};
    if (c.keyword) params['keyword'] = c.keyword;
    if (c.type) params['type'] = c.type;
    if (c.minPrice != null) params['minPrice'] = String(c.minPrice);
    if (c.maxPrice != null) params['maxPrice'] = String(c.maxPrice);
    if (c.city) params['city'] = c.city;
    if (page > 0) params['page'] = String(page);
    this.router.navigate([], { queryParams: params, queryParamsHandling: 'merge' });
  }
}
