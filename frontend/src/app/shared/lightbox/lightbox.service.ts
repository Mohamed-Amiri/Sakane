import { Injectable } from '@angular/core';
import { ModalService } from '../modal/modal.service';
import { LightboxComponent } from './lightbox.component';

/** Photo lightbox (js/ui.js openLightbox) — built on top of ModalService. */
@Injectable({ providedIn: 'root' })
export class LightboxService {
  constructor(private readonly modal: ModalService) {}

  open(photos: string[], start = 0, title?: string): void {
    this.modal.open(
      LightboxComponent,
      { title: title || 'Photos', wide: true, cls: 'modal--lightbox' },
      { photos, start, title }
    );
  }
}
