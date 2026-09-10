import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-action-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>{{ message }}</p>
    <p class="text-sm text-secondary">{{ detail }}</p>
    @if (withMessage) {
      <div class="form-field mb-0">
        <label class="form-label" for="owner-msg">Message to the tenant <span class="optional">(optional)</span></label>
        <textarea class="textarea" id="owner-msg" rows="2" maxlength="500" [value]="msgText()" (input)="msgText.set($any($event).target.value)"></textarea>
      </div>
    }
    <div class="modal__actions">
      <button class="btn btn--secondary" type="button" (click)="modal.close()">Back</button>
      <button
        class="btn"
        [class.btn--danger]="danger"
        [class.btn--primary]="!danger"
        type="button"
        (click)="onConfirm?.(msgText() || null)"
      >
        {{ confirmLabel || 'Confirm' }}
      </button>
    </div>
  `
})
export class ActionModalComponent {
  @Input() message = '';
  @Input() detail = '';
  @Input() confirmLabel?: string;
  @Input() danger = false;
  @Input() withMessage = false;
  @Input() onConfirm: ((message: string | null) => void) | null = null;

  readonly msgText = signal('');

  constructor(public readonly modal: ModalService) {}
}
