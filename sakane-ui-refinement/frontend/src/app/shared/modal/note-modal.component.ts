import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-note-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>{{ body }}</p>
    <div class="modal__actions">
      <button class="btn btn--secondary" type="button" (click)="modal.close()">Close</button>
    </div>
  `
})
export class NoteModalComponent {
  @Input() body = '';

  constructor(public readonly modal: ModalService) {}
}
