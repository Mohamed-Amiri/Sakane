import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './shared/bottom-nav/bottom-nav.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { ModalHostComponent } from './shared/modal/modal-host.component';
import { ToastRegionComponent } from './shared/toast/toast-region.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, BottomNavComponent, ToastRegionComponent, ModalHostComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}
