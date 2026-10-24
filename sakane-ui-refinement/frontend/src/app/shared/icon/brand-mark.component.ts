import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Cobalt tile with a cyan "roofline" notch — ported from js/ui.js BRAND_MARK. */
@Component({
  selector: 'app-brand-mark',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="brand__mark" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#2b3fdc" />
      <path d="M7 16.5 14 9l7 7.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M10 20h8" stroke="#7fd3e6" stroke-width="2.4" stroke-linecap="round" />
    </svg>
  `
})
export class BrandMarkComponent {}
