import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contact-page">
      <div class="container">
        <div class="contact-header">
          <h1>Contactez-nous</h1>
          <p>Nous sommes là pour vous aider. N'hésitez pas à nous contacter.</p>
        </div>

        <div class="contact-content">
          <div class="contact-info">
            <h2>Informations de contact</h2>
            <div class="info-item">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
                             <div class="info-content">
                 <h3>Email</h3>
                 <p>contact&#64;locaspace.com</p>
               </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div class="info-content">
                <h3>Téléphone</h3>
                <p>+33 1 23 45 67 89</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="info-content">
                <h3>Adresse</h3>
                <p>123 Rue de la Paix<br>75001 Paris, France</p>
              </div>
            </div>
          </div>

          <div class="contact-form">
            <h2>Envoyez-nous un message</h2>
            <form (ngSubmit)="onSubmit()" #contactForm="ngForm">
              <div class="form-group">
                <label for="name">Nom complet *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  [(ngModel)]="formData.name"
                  required
                  class="form-input">
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  [(ngModel)]="formData.email"
                  required
                  class="form-input">
              </div>

              <div class="form-group">
                <label for="subject">Sujet *</label>
                <select
                  id="subject"
                  name="subject"
                  [(ngModel)]="formData.subject"
                  required
                  class="form-input">
                  <option value="">Sélectionnez un sujet</option>
                  <option value="general">Question générale</option>
                  <option value="support">Support technique</option>
                  <option value="billing">Facturation</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div class="form-group">
                <label for="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  [(ngModel)]="formData.message"
                  required
                  rows="5"
                  class="form-input"></textarea>
              </div>

              <button type="submit" class="submit-btn" [disabled]="!contactForm.valid || isSubmitting">
                <span *ngIf="!isSubmitting">Envoyer le message</span>
                <span *ngIf="isSubmitting">Envoi en cours...</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-page {
      padding: 40px 0;
      background: #f8fafc;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .contact-header {
      text-align: center;
      margin-bottom: 60px;
    }

    .contact-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 16px;
    }

    .contact-header p {
      font-size: 1.125rem;
      color: #6b7280;
      max-width: 600px;
      margin: 0 auto;
    }

    .contact-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: start;
    }

    .contact-info h2,
    .contact-form h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 32px;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 32px;
    }

    .info-icon {
      margin-right: 16px;
      color: #3b82f6;
      flex-shrink: 0;
    }

    .info-content h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .info-content p {
      color: #6b7280;
      line-height: 1.6;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .submit-btn {
      width: 100%;
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .submit-btn:hover:not(:disabled) {
      background: #2563eb;
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .contact-content {
        grid-template-columns: 1fr;
        gap: 40px;
      }

      .contact-header h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;

  onSubmit() {
    this.isSubmitting = true;
    
    // Simulate form submission
    setTimeout(() => {
      this.isSubmitting = false;
      // Reset form
      this.formData = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };
      alert('Message envoyé avec succès !');
    }, 2000);
  }
} 