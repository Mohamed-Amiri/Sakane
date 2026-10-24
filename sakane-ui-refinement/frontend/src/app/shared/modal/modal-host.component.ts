import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { FocusTrapDirective } from './focus-trap.directive';
import { ModalService } from './modal.service';

/**
 * Single modal outlet mounted once in AppComponent. Renders whatever
 * `ModalService.current()` points to via `NgComponentOutlet`, wrapped in
 * the prototype's `.modal-overlay` / `.modal` markup (js/ui.js openModal).
 */
@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [CommonModule, IconComponent, FocusTrapDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (modal.current(); as state) {
      <div class="modal-overlay" (click)="onOverlayClick($event)">
        <div
          class="modal"
          [class.modal--wide]="state.config.wide"
          [ngClass]="state.config.cls"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          appFocusTrap
          (escape)="modal.close()"
        >
          <div class="modal__head">
            <h2 id="modal-title" [class.sr-only]="state.config.hideTitle">{{ state.config.title }}</h2>
            <button class="modal__close" type="button" aria-label="Close dialog" (click)="modal.close()">
              <app-icon name="close" />
            </button>
          </div>
          <div class="modal__body">
            <ng-container *ngComponentOutlet="state.component; inputs: state.inputs" />
          </div>
        </div>
      </div>
    }
  `
})
export class ModalHostComponent {
  constructor(public readonly modal: ModalService) {}

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.modal.close();
    }
  }
}
