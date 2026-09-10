import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToastService } from '../../core/ui/toast.service';

/** Live region for toast notifications — present before the first message (js/ui.js toastRegion). */
@Component({
  selector: 'app-toast-region',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-region" aria-live="polite" aria-relevant="additions">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class.toast--error]="t.kind === 'error'" [class.toast--success]="t.kind === 'success'" [attr.role]="t.kind === 'error' ? 'alert' : 'status'">
          <div>{{ t.message }}</div>
          <button type="button" aria-label="Dismiss notification" (click)="toast.dismiss(t.id)">✕</button>
        </div>
      }
    </div>
  `
})
export class ToastRegionComponent {
  constructor(public readonly toast: ToastService) {}
}
