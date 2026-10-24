import { Injectable, Type, signal } from '@angular/core';
import { ConfirmModalComponent } from './confirm-modal.component';

export interface ModalConfig {
  title: string;
  /** Visually hide the heading (still read by AT via aria-labelledby) when the content renders its own heading. */
  hideTitle?: boolean;
  wide?: boolean;
  /** Extra class appended to `.modal` (e.g. `modal--lightbox`). */
  cls?: string;
}

export interface ModalState {
  id: number;
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
  config: ModalConfig;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

/**
 * Global modal service (js/ui.js openModal/closeModal/confirmModal).
 * `ModalHostComponent` (mounted once in AppComponent) renders whatever is
 * currently in `current()` using `NgComponentOutlet`, wrapped in the
 * shared `.modal-overlay`/`.modal` chrome + focus trap.
 *
 * Content components can close themselves by injecting `ModalService`
 * and calling `closeWithResult(result)`.
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  private idSeq = 0;
  private resolvers = new Map<number, (result: unknown) => void>();
  readonly current = signal<ModalState | null>(null);

  open<TResult = unknown>(
    component: Type<unknown>,
    config: ModalConfig,
    inputs?: Record<string, unknown>
  ): Promise<TResult | undefined> {
    this.close();
    const id = ++this.idSeq;
    return new Promise<TResult | undefined>((resolve) => {
      this.resolvers.set(id, resolve as (result: unknown) => void);
      this.current.set({ id, component, inputs, config });
    });
  }

  closeWithResult(result?: unknown): void {
    const state = this.current();
    if (!state) return;
    const resolve = this.resolvers.get(state.id);
    this.resolvers.delete(state.id);
    this.current.set(null);
    resolve?.(result);
  }

  close(): void {
    this.closeWithResult(undefined);
  }

  /** Lets content components (e.g. the lightbox) update the visible modal title reactively. */
  updateTitle(title: string): void {
    const state = this.current();
    if (!state) return;
    this.current.set({ ...state, config: { ...state.config, title } });
  }

  /** Simple confirm/cancel dialog. Resolves `true` on confirm, `false` on cancel/dismiss. */
  async confirm(options: ConfirmOptions): Promise<boolean> {
    const result = await this.open<boolean>(
      ConfirmModalComponent,
      { title: options.title },
      {
        message: options.message,
        confirmLabel: options.confirmLabel,
        cancelLabel: options.cancelLabel,
        danger: options.danger
      }
    );
    return !!result;
  }
}
