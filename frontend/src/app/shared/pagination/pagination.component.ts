import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { plural } from '../../core/ui/format';

export interface PaginationInfo {
  number: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

/** Ported from js/ui.js renderPagination. */
@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (page && page.totalPages > 1) {
      <nav class="pagination" aria-label="Pagination">
        <button class="page-btn" type="button" aria-label="Previous page" [disabled]="page.first" (click)="go(page.number - 1)">‹ Prev</button>
        @for (i of pageIndexes(); track i) {
          <button
            class="page-btn"
            type="button"
            [attr.aria-label]="'Page ' + (i + 1)"
            [attr.aria-current]="i === page.number ? 'page' : null"
            (click)="go(i)"
          >
            {{ i + 1 }}
          </button>
        }
        <button class="page-btn" type="button" aria-label="Next page" [disabled]="page.last" (click)="go(page.number + 1)">Next ›</button>
        <span class="pagination__info">{{ plural(page.totalElements, 'place') }}</span>
      </nav>
    }
  `
})
export class PaginationComponent {
  @Input() page: PaginationInfo | null = null;
  @Output() pageChange = new EventEmitter<number>();

  readonly plural = plural;

  pageIndexes(): number[] {
    return this.page ? Array.from({ length: this.page.totalPages }, (_, i) => i) : [];
  }

  go(index: number): void {
    this.pageChange.emit(index);
  }
}
