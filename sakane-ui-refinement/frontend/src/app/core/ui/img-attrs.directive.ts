import { Directive, ElementRef, Input, OnChanges } from '@angular/core';
import { photoUrl } from './photo-url';

/**
 * Responsive image attributes (js/ui.js `imgAttrs`). Unsplash seed URLs get
 * a `srcset`/`sizes` pair by swapping their `w=` query param; any other URL
 * (uploads, owner-provided) passes through untouched. Backend-relative
 * upload paths are resolved to the API origin first (see `photoUrl`). Use
 * `[eager]` for the LCP hero / first gallery image (`fetchpriority="high"`),
 * otherwise the image lazy-loads.
 */
@Directive({
  selector: 'img[appImg]',
  standalone: true
})
export class ImgAttrsDirective implements OnChanges {
  @Input('appImg') url: string | null | undefined = '';
  @Input() sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px';
  @Input() widths: number[] = [320, 480, 640, 960];
  @Input() eager = false;

  constructor(private readonly el: ElementRef<HTMLImageElement>) {}

  ngOnChanges(): void {
    const img = this.el.nativeElement;
    const url = photoUrl(this.url || '');

    img.loading = this.eager ? 'eager' : 'lazy';
    img.decoding = 'async';
    if (this.eager) {
      img.setAttribute('fetchpriority', 'high');
    } else {
      img.removeAttribute('fetchpriority');
    }

    if (/images\.unsplash\.com/.test(url)) {
      const base = url.replace(/([?&])w=\d+/, '$1w=__W__');
      if (base.includes('__W__')) {
        img.srcset = this.widths.map((w) => `${base.replace('__W__', String(w))} ${w}w`).join(', ');
        img.sizes = this.sizes;
        img.src = base.replace('__W__', String(this.widths[Math.min(1, this.widths.length - 1)]));
        return;
      }
    }

    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src = url;
  }
}
