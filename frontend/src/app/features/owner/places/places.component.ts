import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LieuService } from '../../../core/api/lieu.service';
import { LieuResponse } from '../../../core/api/models';
import { prettyType } from '../../../core/ui/types';
import { money } from '../../../core/ui/format';
import { IconComponent } from '../../../shared/icon/icon.component';
import { SkeletonRowsComponent } from '../../../shared/skeleton/skeleton-rows.component';
import { StateBlockComponent } from '../../../shared/state-block/state-block.component';
import { ModalService } from '../../../shared/modal/modal.service';
import { OwnerSubnavComponent } from '../../../shared/owner-subnav/owner-subnav.component';
import { ImgAttrsDirective } from '../../../core/ui/img-attrs.directive';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-owner-places',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    SkeletonRowsComponent,
    StateBlockComponent,
    OwnerSubnavComponent,
    ImgAttrsDirective
  ],
  template: `
    <section class="container page-section">
      <div class="page-head">
        <div>
          <h1>My places</h1>
          <p class="page-head__sub">Every place you publish is live immediately — there is no approval step.</p>
        </div>
        <a class="btn btn--primary" routerLink="/owner/places/new">+ New place</a>
      </div>

      <app-owner-subnav />

      @if (error()) {
        <app-state-block
          kind="error"
          icon="warn"
          title="Could not load your places"
          message="Your places could not be loaded."
          (retry)="load()"
        />
      } @else if (places() !== null) {
        @if (places()!.length === 0) {
          <app-state-block icon="home" title="No places yet" message="Publish your first place — it goes live immediately, there is no approval step.">
            <a class="btn btn--primary" routerLink="/owner/places/new">Create a place</a>
          </app-state-block>
        } @else {
          <div id="places-table" aria-live="polite">
            <div class="table-wrap">
              <table class="data-table data-table--stack">
                <thead>
                  <tr>
                    <th scope="col">Place</th>
                    <th scope="col">Type</th>
                    <th scope="col" class="num">Price / night</th>
                    <th scope="col">Rating</th>
                    <th scope="col" class="num">Photos</th>
                    <th scope="col"><span class="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  @for (l of places(); track l.id) {
                    <tr>
                      <td class="cell-lead">
                        <div class="cell-media">
                          @if (l.photos && l.photos[0]) {
                            <img [appImg]="photoUrl(l.photos[0])" [sizes]="'56px'" [widths]="[120, 240]" [alt]="l.titre" />
                          } @else {
                            <span class="avatar" aria-hidden="true"><app-icon name="home" /></span>
                          }
                          <div class="cell-media__text">
                            <strong><a [routerLink]="['/places', l.id]">{{ l.titre }}</a></strong>
                            <span>{{ l.city || l.adresse }}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Type">{{ prettyType(l.type) }}</td>
                      <td data-label="Price / night" class="num">{{ money(l.prix) }}</td>
                      <td data-label="Rating">
                        @if (l.averageRating != null) {
                          {{ l.averageRating.toFixed(1) }} ★ <span class="text-muted">({{ l.reviewCount || 0 }})</span>
                        } @else {
                          <span class="text-muted">No reviews</span>
                        }
                      </td>
                      <td data-label="Photos" class="num">{{ l.photos ? l.photos.length : 0 }} / 10</td>
                      <td class="cell-actions">
                        <div class="data-table__actions">
                          <a class="btn btn--sm btn--secondary" [routerLink]="['/owner/places', l.id, 'edit']">Edit</a>
                          <a class="btn btn--sm btn--secondary" [routerLink]="['/owner', 'places', l.id, 'calendar']">Calendar</a>
                          <button class="btn btn--sm btn--danger-outline" type="button" (click)="confirmDelete(l)">Delete</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      } @else {
        <app-skeleton-rows [count]="1" cssClass="skeleton--tall" />
      }
    </section>
  `
})
export class PlacesComponent implements OnInit {
  private lieuService = inject(LieuService);
  private modal = inject(ModalService);

  readonly places = signal<LieuResponse[] | null>(null);
  readonly error = signal(false);

  readonly money = money;
  readonly prettyType = prettyType;

  ngOnInit(): void {
    this.load();
  }

  photoUrl(url: string): string {
    return photoUrl(url, environment.apiBaseUrl);
  }

  load(): void {
    this.error.set(false);
    this.lieuService.getMy().subscribe({
      next: (rows) => this.places.set(rows),
      error: () => this.error.set(true)
    });
  }

  confirmDelete(l: LieuResponse): void {
    this.modal.confirm({
      title: 'Delete this place?',
      message: `“${l.titre}” will be removed along with its reservations and reviews. This cannot be undone.`,
      confirmLabel: 'Delete place',
      danger: true
    }).then((confirmed) => {
      if (!confirmed) return;
      this.lieuService.delete(l.id).subscribe({
        next: () => {
          const rows = this.places();
          if (rows) this.places.set(rows.filter(r => r.id !== l.id));
        },
        error: () => {}
      });
    });
  }
}

function photoUrl(url: string, apiBaseUrl: string): string {
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
