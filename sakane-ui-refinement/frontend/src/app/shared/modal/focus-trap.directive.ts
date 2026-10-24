import { Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus trap for modals/lightbox (Tab/Shift+Tab cycling, Escape emits,
 * body scroll lock via `has-modal`, restores focus to the trigger on
 * destroy). Ported from js/ui.js openModal/closeModal.
 */
@Directive({
  selector: '[appFocusTrap]',
  standalone: true
})
export class FocusTrapDirective implements OnInit, OnDestroy {
  @Input() autofocusSelector = 'input, select, textarea, button';
  @Output() escape = new EventEmitter<void>();

  private lastFocused: HTMLElement | null = null;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.lastFocused = document.activeElement as HTMLElement | null;
    document.body.classList.add('has-modal');
    // Wait a tick so the content projected via NgComponentOutlet has rendered.
    setTimeout(() => {
      // Content may already have focused something itself (e.g. the lightbox's "next" button) — don't steal it.
      if (this.host.nativeElement.contains(document.activeElement) && document.activeElement !== this.host.nativeElement) {
        return;
      }
      const target =
        this.host.nativeElement.querySelector<HTMLElement>(this.autofocusSelector) ??
        this.host.nativeElement.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      target?.focus();
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('has-modal');
    if (this.lastFocused && document.contains(this.lastFocused)) {
      this.lastFocused.focus();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.escape.emit();
      return;
    }
    if (event.key === 'Tab') {
      const nodes = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (n) => n.offsetParent !== null
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
}
