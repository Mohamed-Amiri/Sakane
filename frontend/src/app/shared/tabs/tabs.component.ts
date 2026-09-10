import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface TabDef {
  value: string;
  label: string;
}

/** Roving-tabindex tab list with arrow-key navigation and count badges (js/ui.js initTabs). */
@Component({
  selector: 'app-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tabs" role="tablist" [attr.aria-label]="ariaLabel">
      @for (tab of tabs; track tab.value; let i = $index) {
        <button
          role="tab"
          type="button"
          [id]="'tab-' + tab.value"
          [attr.aria-selected]="tab.value === selected ? 'true' : 'false'"
          [tabIndex]="tab.value === selected ? 0 : -1"
          [attr.aria-label]="counts?.[tab.value] != null ? tab.label + ' (' + counts![tab.value] + ')' : tab.label"
          (click)="select(tab.value, false)"
          (keydown)="onKeydown($event, i)"
        >
          <span>{{ tab.label }}</span>
          @if (counts?.[tab.value] != null) {
            <span class="tab__count" aria-hidden="true">{{ counts![tab.value] }}</span>
          }
        </button>
      }
    </div>
  `
})
export class TabsComponent {
  @Input({ required: true }) tabs: TabDef[] = [];
  @Input() selected = '';
  @Input() counts: Record<string, number> | null = null;
  @Input() ariaLabel = 'Tabs';
  @Output() selectedChange = new EventEmitter<string>();

  select(value: string, focus: boolean): void {
    this.selectedChange.emit(value);
    if (focus) {
      setTimeout(() => document.getElementById(`tab-${value}`)?.focus());
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % this.tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + this.tabs.length) % this.tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = this.tabs.length - 1;

    if (next !== null) {
      event.preventDefault();
      this.select(this.tabs[next].value, true);
    }
  }
}
