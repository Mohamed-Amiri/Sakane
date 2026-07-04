import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  socialLinks = [
    { name: 'Facebook', url: '#' },
    { name: 'Twitter', url: '#' },
    { name: 'Instagram', url: '#' },
    { name: 'LinkedIn', url: '#' }
  ];

  quickLinks = [
    { name: 'Accueil', url: '/' },
    { name: 'À propos', url: '/about' },
    { name: 'Services', url: '/services' },
    { name: 'Contact', url: '/contact' }
  ];

  legalLinks = [
    { name: 'Mentions légales', url: '/legal' },
    { name: 'Politique de confidentialité', url: '/privacy' },
    { name: 'CGU', url: '/terms' }
  ];
}