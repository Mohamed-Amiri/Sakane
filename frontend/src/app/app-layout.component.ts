import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, switchMap, startWith } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';
import { AuthService, User as AuthUser } from './auth/auth.service';
import { NotificationService, Notification } from './shared/notifications/notification.service';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
}

interface LayoutUser {
  name: string;
  role: string;
  avatar: string;
  initials: string;
}

import { MessagingPanelComponent } from './shared/messaging-panel/messaging-panel.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MessagingPanelComponent],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit {
  sidebarCollapsed = false;
  mobileMenuOpen = false;
  searchQuery = '';
  pageTitle = 'Dashboard';
  showSearch = false;
  userRole: 'owner' | 'tenant' = 'owner';
  notificationCount = 0;
  recentNotifs: Notification[] = [];
  notifOpen = false;
  messagesOpen = false;
  private subs = new Subscription();

  currentUser: LayoutUser = {
    name: '',
    role: '',
    avatar: '',
    initials: ''
  };

  // Menu items based on user role
  get menuItems(): MenuItem[] {
    if (this.userRole === 'owner') {
      return [
        { label: 'Tableau de bord', route: '/proprietaires/dashboard', icon: 'ph ph-squares-four' },
        { label: 'Mes Propriétés', route: '/proprietaires/manage-properties', icon: 'ph ph-house' },
        { label: 'Demandes', route: '/proprietaires/booking-requests', icon: 'ph ph-clipboard-text' },
        { label: 'Ajouter', route: '/proprietaires/add-property', icon: 'ph ph-plus-circle' },
      ];
    } else { // tenant
      return [
        { label: 'Mon Espace', route: '/locataire/dashboard', icon: 'ph ph-squares-four' },
        { label: 'Rechercher', route: '/locataire/search', icon: 'ph ph-magnifying-glass' },
        { label: 'Réservations', route: '/locataire/reservations', icon: 'ph ph-calendar-check' },
        { label: 'Favoris', route: '/locataire/favorites', icon: 'ph ph-heart' },
      ];
    }
  }

  constructor(
    private router: Router, 
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    // Subscribe to real user data from AuthService
    this.authService.currentUser$.subscribe((user: AuthUser | null) => {
      if (user) {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        
        this.currentUser = {
          name: `${firstName} ${lastName}`.trim(),
          role: user.role === 'owner' ? 'Propriétaire' : 'Locataire',
          avatar: '',
          initials: initials || '?'
        };
        this.userRole = user.role === 'owner' ? 'owner' : 'tenant';
      }
    });

    // Update page title based on current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updatePageTitle(event.url);
      // Close mobile menu on navigation
      this.mobileMenuOpen = false;
    });

    // Set initial page title
    this.updatePageTitle(this.router.url);

    // Poll notification count and list every 60 seconds
    this.subs.add(
      interval(60_000).pipe(startWith(0)).subscribe(() => {
        this.subs.add(
          this.notificationService.getUnreadCount().subscribe(count => {
            this.notificationCount = count;
          })
        );
        this.subs.add(
          this.notificationService.getNotifications().subscribe(all => {
            this.recentNotifs = all.slice(0, 8);
          })
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-container')) {
      this.notifOpen = false;
    }
  }

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  toggleNotifications() {
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen) {
      this.closeMobileMenu();
    }
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notificationCount = 0;
      this.recentNotifs.forEach(n => n.lu = true);
    });
  }

  markAsRead(notif: Notification): void {
    if (!notif.lu) {
      this.notificationService.markAsRead(notif.id).subscribe(() => {
        notif.lu = true;
        this.notificationCount = Math.max(0, this.notificationCount - 1);
      });
    }
  }

  getNotifIcon(type: string): string {
    const icons: Record<string, string> = {
      'RESERVATION_CONFIRMED': 'ph-check-circle',
      'RESERVATION_REJECTED': 'ph-x-circle',
      'SYSTEM': 'ph-info',
      'RESERVATION_NEW': 'ph-bell-ringing',
      'NEW_BOOKING_REQUEST': 'ph-calendar-plus',
      'RESERVATION_CANCELLED': 'ph-prohibit'
    };
    return icons[type] || 'ph-bell';
  }

  getNotifColorClass(type: string): string {
    if (type === 'RESERVATION_CONFIRMED') return 'text-gold';
    if (type === 'RESERVATION_REJECTED' || type === 'SYSTEM') return 'text-red';
    if (type === 'RESERVATION_NEW' || type === 'NEW_BOOKING_REQUEST') return 'text-navy';
    if (type === 'RESERVATION_CANCELLED') return 'text-grey';
    return 'text-navy';
  }

  formatNotifTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'À l\'instant';
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)} h`;
    return `Il y a ${Math.floor(diff / 1440)} j`;
  }

  toggleMessages() {
    this.messagesOpen = !this.messagesOpen;
    if (this.messagesOpen) {
      this.closeMobileMenu();
    }
  }

  logout() {
    this.authService.logout();
  }

  private updatePageTitle(url: string) {
    if (url.includes('/proprietaires')) {
      if (url.includes('/dashboard')) {
        this.pageTitle = 'Tableau de bord';
      } else if (url.includes('/manage-properties') || url.includes('/properties')) {
        this.pageTitle = 'Mes Propriétés';
      } else if (url.includes('/booking-requests')) {
        this.pageTitle = 'Demandes de Réservation';
      } else if (url.includes('/add-property')) {
        this.pageTitle = 'Ajouter une Propriété';
      } else {
        this.pageTitle = 'Propriétaire';
      }
    } else if (url.includes('/locataire')) {
      if (url.includes('/dashboard')) {
        this.pageTitle = 'Mon Espace';
      } else if (url.includes('/search')) {
        this.pageTitle = 'Rechercher';
      } else if (url.includes('/reservations')) {
        this.pageTitle = 'Mes Réservations';
      } else if (url.includes('/favorites')) {
        this.pageTitle = 'Favoris';
      } else {
        this.pageTitle = 'Locataire';
      }
    }
  }
}