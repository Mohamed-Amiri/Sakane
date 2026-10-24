import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  kind?: ToastKind;
}

/**
 * Toast/live-region notifications (js/ui.js `toast()`). The region itself
 * (`ToastRegionComponent`) is rendered once at the app root so it exists
 * before the first message — errors get `role="alert"`.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private idSeq = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, kind?: ToastKind): void {
    const id = ++this.idSeq;
    this.toasts.update((list) => [...list, { id, message, kind }]);
    const timeout = kind === 'error' ? 7000 : 4800;
    setTimeout(() => this.dismiss(id), timeout);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
