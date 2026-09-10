import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvisService } from '../../../core/api/avis.service';
import { AvisResponse } from '../../../core/api/models';
import { SkeletonRowsComponent } from '../../../shared/skeleton/skeleton-rows.component';
import { StateBlockComponent } from '../../../shared/state-block/state-block.component';
import { ModalService } from '../../../shared/modal/modal.service';
import { RatingComponent } from '../../../shared/rating/rating.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    SkeletonRowsComponent,
    StateBlockComponent,
    RatingComponent
  ],
  template: `
    <section class="container page-section">
      <div class="page-head">
        <div>
          <h1>My reviews</h1>
          <p class="page-head__sub">One review per place, only after a stay the owner marked completed.</p>
        </div>
      </div>

      @if (error()) {
        <app-state-block kind="error" icon="warn" title="Could not load reviews" message="Your reviews could not be loaded." (retry)="load()" />
      } @else if (rows() !== null) {
        @if (!rows()!.length) {
          <app-state-block
            icon="star"
            title="No reviews yet"
            message="After a stay is completed by the owner, you can review the place from My trips."
          >
            <a class="btn btn--primary" routerLink="/reservations">Go to my trips</a>
          </app-state-block>
        } @else {
          <div class="stack-md" id="my-reviews" aria-live="polite">
            @for (a of rows()!; track a.id) {
              <article class="card">
                <div class="card__body">
                  <div class="cluster cluster--between">
                    <div>
                      <strong><a [routerLink]="['/places', a.lieuId]">{{ a.lieuTitre }}</a></strong>
                      <br />
                      <app-rating [average]="a.note" [count]="null" />
                      @for (i of starArray(a.note); track i) {
                        <span class="text-muted">★</span>
                      }
                    </div>
                    <div class="cluster">
                      <a class="btn btn--sm btn--secondary" [routerLink]="['/review-form']" [queryParams]="{ avisId: a.id, lieuId: a.lieuId }">Edit</a>
                      <button class="btn btn--sm btn--danger-outline" type="button" (click)="confirmDelete(a)">Delete</button>
                    </div>
                  </div>
                  <p class="text-secondary mt-2 mb-0">{{ a.commentaire }}</p>
                </div>
              </article>
            }
          </div>
        }
      } @else {
        <app-skeleton-rows [count]="2" cssClass="skeleton--row" />
      }
    </section>
  `
})
export class ReviewsComponent implements OnInit {
  private avisService = inject(AvisService);
  private modal = inject(ModalService);

  readonly rows = signal<AvisResponse[] | null>(null);
  readonly error = signal(false);

  ngOnInit(): void {
    this.load();
  }

  starArray(note: number): number[] {
    return Array.from({ length: note }, (_, i) => i);
  }

  load(): void {
    this.error.set(false);
    this.avisService.my().subscribe({
      next: (rows: AvisResponse[]) => this.rows.set(rows),
      error: () => this.error.set(true)
    });
  }

  confirmDelete(a: AvisResponse): void {
    this.modal.confirm({
      title: 'Delete this review?',
      message: `Your review of "${a.lieuTitre}" will be permanently removed.`,
      confirmLabel: 'Delete review',
      danger: true
    }).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.avisService.delete(a.id).subscribe({
        next: () => {
          this.rows.update(all => (all || []).filter(x => x.id !== a.id));
        },
        error: () => {}
      });
    });
  }
}
