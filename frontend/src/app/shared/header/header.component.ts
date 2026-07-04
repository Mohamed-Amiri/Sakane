import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../theme/theme.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(
    private theme: ThemeService,
    public authService: AuthService
  ) {}

  isMenuOpen = false;

  get isDark() { return this.theme.isDarkMode(); }
  get isDarkMode() { return this.theme.isDarkMode(); }

  toggleTheme() {
    this.theme.toggleTheme();
    document.body.classList.toggle('dark-mode');
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
  }

  logout() {
    this.authService.logout();
  }
}
