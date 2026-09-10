import { ChangeDetectionStrategy, Component, HostListener, Input, OnInit, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ModalService } from '../modal/modal.service';
import { photoUrl } from '../../core/ui/photo-url';

/** Swap an Unsplash `w=` query param for a higher/lower-res variant (js/ui.js openLightbox). */
function withWidth(url: string, width: number): string {
  return url.replace(/([?&])w=\d+/, `$1w=${width}`);
}

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lightbox__stage">
      <img [src]="stageSrc()" alt="" />
      @if (photos.length > 1) {
        <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous photo" (click)="show(index() - 1)">
          <app-icon name="chevron-left" />
        </button>
        <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next photo" (click)="show(index() + 1)">
          <app-icon name="chevron-right" />
        </button>
      }
    </div>
    @if (photos.length > 1) {
      <div class="lightbox__strip" role="tablist" aria-label="Photo thumbnails">
        @for (photo of photos; track photo; let i = $index) {
          <button type="button" role="tab" [attr.aria-current]="i === index() ? 'true' : 'false'" [attr.aria-label]="'Photo ' + (i + 1)" (click)="show(i)">
            <img [src]="photoUrl(withWidth(photo, 200))" alt="" loading="lazy" />
          </button>
        }
      </div>
    }
  `
})
export class LightboxComponent implements OnInit {
  @Input() photos: string[] = [];
  @Input() start = 0;
  @Input() title?: string;

  readonly index = signal(0);
  readonly withWidth = withWidth;
  readonly photoUrl = photoUrl;

  constructor(private readonly modal: ModalService) {}

  ngOnInit(): void {
    this.show(this.start);
  }

  stageSrc(): string {
    const photo = this.photos[this.index()];
    return photo ? photoUrl(withWidth(photo, 1600)) : '';
  }

  show(n: number): void {
    const count = this.photos.length;
    if (!count) return;
    this.index.set(((n % count) + count) % count);
    const label = this.title || 'Photos';
    this.modal.updateTitle(`${label} · ${this.index() + 1} / ${count}`);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.show(this.index() - 1);
    if (event.key === 'ArrowRight') this.show(this.index() + 1);
  }
}
