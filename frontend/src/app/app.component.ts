import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from './shared/components/toast/toast.service';
import { ThemeService } from './shared/theme/theme.service';
import { ToastComponent } from './shared/components/toast/toast.component';
import { HeaderComponent } from './shared/header/header.component';
import { routeSlideAnimation } from './shared/animations/slide.animation';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// Routes where the global header should NOT be shown
// (they have their own navbar or sidebar)
const NO_HEADER_PREFIXES = ['/locataire', '/proprietaires'];
const NO_HEADER_EXACT = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, ToastComponent],
  template: `
    <app-header *ngIf="showGlobalHeader"></app-header>
    <router-outlet></router-outlet>
    
    <!-- Toast Container -->
    <div class="toast-container">
        <app-toast></app-toast>
    </div>
  `,
  styles: [`
    @use './app.scss';

    .toast-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
    }
  `],
  animations: [routeSlideAnimation]
})
export class AppComponent implements OnInit, OnDestroy {
  isDarkTheme = false;
  showGlobalHeader = false;

  private routerSub?: Subscription;

  constructor(
    private themeService: ThemeService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.isDarkTheme$.subscribe(
      isDark => this.isDarkTheme = isDark
    );

    // Initialize theme from local storage
    this.themeService.initializeTheme();

    // Reactively update header visibility on every navigation
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url: string = event.urlAfterRedirects?.split('?')[0] || event.url?.split('?')[0] || '';
      this.showGlobalHeader = this.shouldShowHeader(url);
    });

    // Set initial value
    const currentUrl = this.router.url.split('?')[0];
    this.showGlobalHeader = this.shouldShowHeader(currentUrl);
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  private shouldShowHeader(url: string): boolean {
    if (NO_HEADER_EXACT.includes(url)) return false;
    if (NO_HEADER_PREFIXES.some(prefix => url.startsWith(prefix))) return false;
    return true;
  }

  getRouteState(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'] || 'initial';
  }
}
