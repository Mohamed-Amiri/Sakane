import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AvisService } from '../../../core/api/avis.service';
import { AvisResponse } from '../../../core/api/models';
import { Location } from '@angular/common';
import { apiErrorMessage, validationErrorsFrom } from '../../../core/api/api-error-presenter';
import { StateBlockComponent } from '../../../shared/state-block/state-block.component';

@Component({
  selector: 'app-review-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, StateBlockComponent],
  template: `
    <section class="container container--narrow page-section">
      <h1 id="review-title">{{ isEdit() ? 'Edit your review' : 'Write a review' }}</h1>
      <div id="review-head">
        @if (lieuTitre()) {
          <p class="text-secondary m-0">{{ lieuTitre() }}</p>
        }
      </div>
      <div id="review-alert" aria-live="assertive">
        @if (serverError()) {
          <div class="field-error">{{ serverError() }}</div>
        }
      </div>

      @if (error()) {
        <app-state-block kind="error" icon="warn" title="Could not load review" message="Your review could not be loaded." (retry)="loadExisting()" />
      } @else {
        <form id="review-form" class="card card--pad" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="form-field">
            <span class="form-label" id="rating-label">Your rating</span>
            <div class="cluster">
              <div class="star-input" role="radiogroup" aria-label="Rating">
                @for (i of [1,2,3,4,5]; track i) {
                  <button
                    class="star-btn"
                    type="button"
                    [class.is-filled]="i <= (form.controls.note.value || 0)"
                    [class.is-hover]="i <= hover()"
                    [attr.aria-label]="i + ' star' + (i > 1 ? 's' : '')"
                    (click)="setNote(i)"
                    (mouseenter)="hover.set(i)"
                    (mouseleave)="hover.set(0)"
                  >
                    ★
                  </button>
                }
              </div>
              <span class="text-secondary text-sm" id="note-value">
                {{ form.controls.note.value ? form.controls.note.value + '/5' : 'Pick a rating' }}
              </span>
            </div>
            @if (form.controls.note.touched && form.controls.note.hasError('required')) {
              <p class="field-error">Please select a rating.</p>
            }
          </div>

          <div class="form-field">
            <label class="form-label" for="rv-comment">Your review</label>
            <textarea
              class="textarea"
              id="rv-comment"
              rows="5"
              formControlName="commentaire"
              minlength="10"
              maxlength="1000"
              placeholder="What was the place like? What should future guests know?"
            ></textarea>
            <p class="form-hint cluster cluster--between">
              <span>10–1000 characters.</span>
              <span class="num" id="rv-count" aria-live="polite">{{ form.controls.commentaire.value?.length || 0 }}/1000</span>
            </p>
            @if (form.controls.commentaire.hasError('minlength') && form.controls.commentaire.touched) {
              <p class="field-error">Your comment must be at least 10 characters.</p>
            }
          </div>

          <div class="cluster">
            <button class="btn btn--primary" type="submit" [class.is-loading]="saving()" [disabled]="form.invalid || saving()">
              <span class="spinner" aria-hidden="true"></span><span>Publish review</span>
            </button>
            <a class="btn btn--ghost" routerLink="/reviews">Cancel</a>
          </div>
        </form>
      }
    </section>
  `
})
export class ReviewFormComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private avisService = inject(AvisService);
  readonly location = inject(Location);

  readonly isEdit = signal(false);
  readonly avisId = signal<number | null>(null);
  readonly lieuId = signal<number | null>(null);
  readonly lieuTitre = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal(false);
  readonly serverError = signal('');
  readonly hover = signal(0);

  form = this.fb.group({
    note: [0, Validators.required],
    commentaire: ['', [Validators.minLength(10), Validators.maxLength(1000)]]
  });

  ngOnInit(): void {
    // Routes are `reviews/new/:lieuId` and `reviews/:avisId/edit` (path params); query params accepted as fallback.
    const params = this.route.snapshot.paramMap;
    const query = this.route.snapshot.queryParamMap;
    const avisIdRaw = params.get('avisId') ?? query.get('avisId');
    const lieuIdRaw = params.get('lieuId') ?? query.get('lieuId');

    if (avisIdRaw) {
      const id = Number(avisIdRaw);
      this.isEdit.set(true);
      this.avisId.set(id);
      this.loadExisting();
    } else if (lieuIdRaw) {
      this.lieuId.set(Number(lieuIdRaw));
    }
  }

  ngOnDestroy(): void {}

  loadExisting(): void {
    this.error.set(false);
    this.avisService.my().subscribe({
      next: (rows) => {
        const found = rows.find(a => a.id === this.avisId());
        if (found) {
          this.form.patchValue({ note: found.note, commentaire: found.commentaire });
          this.lieuTitre.set(found.lieuTitre);
        }
      },
      error: () => this.error.set(true)
    });
  }

  setNote(i: number): void {
    this.form.controls.note.setValue(i);
    this.form.controls.note.markAsTouched();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.serverError.set('');

    const payload = {
      note: this.form.value.note!,
      commentaire: this.form.value.commentaire || ''
    };

    const lieuId = this.lieuId();
    const avisId = this.avisId();

    const req$ = this.isEdit() && avisId
      ? this.avisService.update(avisId, payload)
      : lieuId
        ? this.avisService.create(lieuId, payload)
        : null;

    if (!req$) {
      this.saving.set(false);
      return;
    }

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/reviews']);
      },
      error: (e) => {
        this.saving.set(false);
        const vErrs = validationErrorsFrom(e);
        if (vErrs && Object.keys(vErrs).length) {
          this.serverError.set(Object.values(vErrs).join(' '));
        } else {
          this.serverError.set(apiErrorMessage(e, { generic: 'Could not save your review. Please try again.' }));
        }
      }
    });
  }
}
