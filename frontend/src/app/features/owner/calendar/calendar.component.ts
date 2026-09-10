import { Component, inject, signal, ChangeDetectionStrategy, OnInit, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LieuService } from '../../../core/api/lieu.service';
import { CalendarService } from '../../../core/api/calendar.service';
import { LieuResponse, CalendarEvent } from '../../../core/api/models';
import { fmtRange } from '../../../core/ui/format';
import { IconComponent } from '../../../shared/icon/icon.component';
import { SkeletonRowsComponent } from '../../../shared/skeleton/skeleton-rows.component';
import { StateBlockComponent } from '../../../shared/state-block/state-block.component';
import { ModalService } from '../../../shared/modal/modal.service';
import { OwnerSubnavComponent } from '../../../shared/owner-subnav/owner-subnav.component';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TAG: Record<string, string> = { booked: 'Booked', pending: 'Pending', blocked: 'Blocked' };

@Component({
  selector: 'app-owner-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IconComponent,
    SkeletonRowsComponent,
    StateBlockComponent,
    OwnerSubnavComponent
  ],
  template: `
    <section class="container page-section">
      <app-owner-subnav />

      <div class="page-head">
        <div>
          <h1>Availability calendar</h1>
          <p class="page-head__sub">Reservations appear automatically; block extra dates yourself. Blocks that overlap a reservation are rejected.</p>
        </div>
      </div>
      @if (!places().length) {
        <app-state-block
          icon="calendar"
          title="No places to manage"
          message="Create a place first, then manage its availability here."
        >
          <a class="btn btn--primary" routerLink="/owner/places/new">Create a place</a>
        </app-state-block>
      } @else {
        <div class="form-field place-select">
          <label class="form-label" for="cal-place">Place</label>
          <select id="cal-place" class="select" [value]="lieuId()" (change)="onPlaceChange($any($event).target.value)">
            @for (l of places(); track l.id) {
              <option [value]="l.id">{{ l.titre }}</option>
            }
          </select>
        </div>

        <div class="dash-columns dash-columns--cal">
          <section class="cal" aria-label="Month view">
            <div class="cal__head">
              <div class="cluster cluster--tight">
                <button class="btn btn--secondary btn--sm" type="button" aria-label="Previous month" (click)="prevMonth()">‹</button>
                <button class="btn btn--secondary btn--sm" type="button" aria-label="Next month" (click)="nextMonth()">›</button>
                <button class="btn btn--ghost btn--sm" type="button" (click)="goToday()">Today</button>
              </div>
              <h2 id="cal-title" aria-live="polite">{{ monthLabel() }}</h2>
            </div>

            @if (calError()) {
              <app-state-block kind="error" icon="warn" title="Calendar unavailable" [message]="calError()" (retry)="draw()" />
            } @else if (calendarReady()) {
              <table class="cal__table">
                <caption class="sr-only">Availability for {{ monthLabel() }}</caption>
                <thead>
                  <tr>
                    @for (d of dayLabels; track d) {
                      <th scope="col"><span aria-hidden="true">{{ d }}</span></th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (week of weeks(); track week[0].key + week[6].key) {
                    <tr>
                      @for (cell of week; track cell.key) {
                        <td class="cal__day"
                          [class.cal__day--out]="cell.out"
                          [class.cal__day--booked]="cell.state === 'booked'"
                          [class.cal__day--pending]="cell.state === 'pending'"
                          [class.cal__day--blocked]="cell.state === 'blocked'"
                          [class.cal__day--past]="cell.past && !cell.out"
                          [class.cal__day--today]="cell.today"
                          [attr.aria-label]="cell.label">
                          <span class="cal__num" aria-hidden="true">{{ cell.day }}</span>
                          @if (cell.state) {
                            <span class="cal__tag" aria-hidden="true">{{ cell.state === 'booked' ? 'Booked' : cell.state === 'pending' ? 'Pending' : 'Blocked' }}</span>
                          }
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <app-skeleton-rows [count]="1" cssClass="skeleton--tall" />
            }

            <div class="cal-legend" aria-hidden="true">
              <span><i class="is-booked"></i> Booked</span>
              <span><i class="is-pending"></i> Pending</span>
              <span><i class="is-blocked"></i> Blocked</span>
            </div>
          </section>

          <div class="stack-md">
            <form class="card card--pad" id="block-form" novalidate [formGroup]="blockForm" (ngSubmit)="onBlock()">
              <h2 class="card-title mb-3">Block dates</h2>
              <div class="booking-dates">
                <div class="form-field">
                  <label class="form-label" for="bl-start">From</label>
                  <input id="bl-start" class="input" type="date" formControlName="startDate" [min]="todayIso()" />
                </div>
                <div class="form-field">
                  <label class="form-label" for="bl-end">To</label>
                  <input id="bl-end" class="input" type="date" formControlName="endDate" [min]="blockForm.get('startDate')?.value || todayIso()" />
                </div>
              </div>
              <div class="form-field">
                <label class="form-label" for="bl-title">Label <span class="optional">(optional)</span></label>
                <input id="bl-title" class="input" type="text" formControlName="title" maxlength="80" placeholder="e.g. Maintenance" />
              </div>
              <p class="field-error" id="block-error" aria-live="polite">{{ blockError() }}</p>
              <button class="btn btn--primary" type="submit" [class.is-loading]="blockLoading()" [disabled]="blockForm.invalid || blockLoading()">
                <span class="spinner" aria-hidden="true"></span><span>Block dates</span>
              </button>
            </form>

            <section class="card card--pad" aria-labelledby="ev-h">
              <h2 id="ev-h" class="card-title mb-3">This month</h2>
              <div class="stack-sm" id="cal-events">
                @if (calEvents()) {
                  @if (!calEvents()!.length) {
                    <p class="text-secondary text-sm m-0">No reservations or blocked dates this month.</p>
                  }
                  @for (ev of reservationEvents(); track ev.startDate + ev.title) {
                    <div class="notif notif--compact">
                      <span class="notif__icon" aria-hidden="true"><app-icon name="calendar" /></span>
                      <div class="notif__body">
                        <p class="notif__title notif__title--sm">
                          {{ ev.title }}
                          <span class="badge" [class.badge--confirmed]="ev.type === 'booked'" [class.badge--pending]="ev.type === 'pending'">
                            {{ ev.type === 'booked' ? 'Booked' : 'Pending' }}
                          </span>
                        </p>
                        <p class="notif__msg">{{ fmtRange(ev.startDate, ev.endDate) }} <span class="text-muted">(last night)</span></p>
                      </div>
                    </div>
                  }
                  @for (ev of blockedEvents(); track ev.id) {
                    <div class="notif notif--compact">
                      <span class="notif__icon notif__icon--muted" aria-hidden="true"><app-icon name="clock" /></span>
                      <div class="notif__body">
                        <p class="notif__title notif__title--sm">
                          {{ ev.title }} <span class="badge badge--cancelled">Blocked</span>
                        </p>
                        <p class="notif__msg">{{ fmtRange(ev.startDate, ev.endDate) }}</p>
                      </div>
                      <div class="notif__actions">
                        <button class="btn btn--sm btn--danger-outline" type="button" (click)="confirmUnblock(ev)">Unblock</button>
                      </div>
                    </div>
                  }
                }
              </div>
            </section>
          </div>
        </div>
      }
    </section>
  `
})
export class CalendarComponent implements OnInit {
  private lieuService = inject(LieuService);
  private calendarService = inject(CalendarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private modal = inject(ModalService);
  private fb = inject(FormBuilder);

  readonly dayLabels = DAY_LABELS;
  readonly fmtRange = fmtRange;

  readonly places = signal<LieuResponse[]>([]);
  readonly lieuId = signal<number>(0);
  readonly calEvents = signal<CalendarEvent[] | null>(null);
  readonly calError = signal('');
  readonly calendarReady = signal(false);
  readonly blockLoading = signal(false);
  readonly blockError = signal('');

  private month = signal(firstOfMonth(new Date()));
  private drawSeq = 0;

  readonly monthLabel = computed(() => this.month().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }));

  readonly reservationEvents = computed(() => (this.calEvents() || []).filter(e => e.type !== 'blocked'));
  readonly blockedEvents = computed(() => (this.calEvents() || []).filter(e => e.type === 'blocked'));

  readonly weeks = computed(() => {
    const events = this.calEvents();
    if (!events) return [] as CalendarCell[][];
    const m = this.month();
    const y = m.getFullYear(), mo = m.getMonth();

    const dayState: Record<string, string> = {};
    for (const ev of events) {
      const last = ev.type === 'blocked'
        ? new Date(ev.endDate).getTime() - 86400000
        : new Date(ev.endDate).getTime();
      for (let t = new Date(ev.startDate).getTime(); t <= last; t += 86400000) {
        const key = new Date(t).toISOString().slice(0, 10);
        if (!dayState[key] || ev.type === 'booked') dayState[key] = ev.type;
      }
    }

    const firstDow = (new Date(y, mo, 1).getDay() + 6) % 7;
    const daysIn = new Date(y, mo + 1, 0).getDate();
    const todayKey = todayIso();

    const cells: CalendarCell[] = [];
    for (let i = 0; i < firstDow; i++) {
      cells.push({ day: 0, key: `out-${i}`, out: true, state: '', past: false, today: false, label: '' });
    }
    for (let day = 1; day <= daysIn; day++) {
      const key = `${y}-${pad2(mo + 1)}-${pad2(day)}`;
      const st = dayState[key] || '';
      const past = key < todayKey;
      const isToday = key === todayKey;
      const label = new Date(y, mo, day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
        + (st ? `, ${TAG[st]}` : ', available')
        + (isToday ? ', today' : '');
      cells.push({ day, key, out: false, state: st, past, today: isToday, label });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: 0, key: `out-tail-${cells.length}`, out: true, state: '', past: false, today: false, label: '' });
    }

    const weeksArr: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeksArr.push(cells.slice(i, i + 7));
    }
    return weeksArr;
  });

  readonly blockForm = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    title: ['']
  });

  ngOnInit(): void {
    // The calendar route is `owner/places/:id/calendar` (path param); a query-param id is accepted as well.
    const idParam = this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.queryParamMap.get('id');
    this.lieuService.getMy().subscribe({
      next: (rows) => {
        this.places.set(rows);
        if (!rows.length) return;
        const id = idParam ? Number(idParam) : null;
        const validId = id && rows.some(l => l.id === id) ? id : rows[0].id;
        this.lieuId.set(validId);
        this.draw();
      },
      error: () => {}
    });
  }

  todayIso(): string {
    return todayIso();
  }

  onPlaceChange(value: string): void {
    const id = Number(value);
    this.lieuId.set(id);
    const url = this.router.createUrlTree([], { queryParams: { id }, queryParamsHandling: 'merge' });
    this.router.navigateByUrl(url);
    this.draw();
  }

  prevMonth(): void {
    this.month.update(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; });
    this.draw();
  }

  nextMonth(): void {
    this.month.update(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; });
    this.draw();
  }

  goToday(): void {
    this.month.set(firstOfMonth(new Date()));
    this.draw();
  }

  draw(): void {
    const seq = ++this.drawSeq;
    this.calendarReady.set(false);
    this.calError.set('');
    const m = this.month();
    const y = m.getFullYear(), mo = m.getMonth();
    const start = `${y}-${pad2(mo + 1)}-01`;
    const end = `${y}-${pad2(mo + 1)}-${pad2(new Date(y, mo + 1, 0).getDate())}`;
    this.calendarService.events(this.lieuId(), start, end).subscribe({
      next: (events) => {
        if (seq !== this.drawSeq) return;
        this.calEvents.set(events);
        this.calendarReady.set(true);
      },
      error: (e) => {
        if (seq !== this.drawSeq) return;
        this.calError.set(e.message || 'The calendar could not be loaded.');
      }
    });
  }

  confirmUnblock(ev: CalendarEvent): void {
    this.modal.confirm({
      title: 'Remove this block?',
      message: `The dates ${fmtRange(ev.startDate, ev.endDate)} will become available again.`,
      confirmLabel: 'Unblock dates',
      cancelLabel: 'Keep block'
    }).then(confirmed => {
      if (!confirmed) return;
      this.calendarService.deleteEvent(ev.id!).subscribe({
        next: () => this.draw(),
        error: () => {}
      });
    });
  }

  onBlock(): void {
    this.blockError.set('');
    if (this.blockForm.invalid) return;
    const v = this.blockForm.value;
    if (v.endDate && v.startDate && v.endDate < v.startDate) {
      this.blockError.set('Enter a valid date range (end on or after start).');
      return;
    }
    this.blockLoading.set(true);
    this.calendarService.block(this.lieuId(), {
      startDate: v.startDate!,
      endDate: v.endDate!,
      title: v.title?.trim() || undefined
    }).subscribe({
      next: () => {
        this.blockLoading.set(false);
        this.blockForm.reset();
        const startDate = v.startDate!;
        this.month.set(firstOfMonth(new Date(startDate + 'T00:00:00')));
        this.draw();
      },
      error: (e) => {
        this.blockLoading.set(false);
        this.blockError.set(e.message || 'Could not block those dates.');
      }
    });
  }
}

interface CalendarCell {
  day: number;
  key: string;
  out: boolean;
  state: string;
  past: boolean;
  today: boolean;
  label: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function firstOfMonth(d: Date): Date {
  const n = new Date(d);
  n.setDate(1);
  return n;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
