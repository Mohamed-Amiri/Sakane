import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>{{ message }}</p>
    <div class="modal__actions">
      <button class="btn btn--secondary" type="button" (click)="modal.closeWithResult(false)">
        {{ cancelLabel || 'Keep it' }}
      </button>
      <button
        class="btn"
        [class.btn--danger]="danger"
        [class.btn--primary]="!danger"
        type="button"
        (click)="modal.closeWithResult(true)"
      >
        {{ confirmLabel || 'Confirm' }}
      </button>
    </div>
  `
})
export class ConfirmModalComponent {
  @Input() message = '';
  @Input() confirmLabel?: string;
  @Input() cancelLabel?: string;
  @Input() danger = false;

  constructor(public readonly modal: ModalService) {}
}
