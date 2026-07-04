import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { fadeInUpAnimation } from '../../shared/animations/fade.animation';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [fadeInUpAnimation],
  template: `
    <div class="verify-email-container">
      <div class="verify-email-card" [@fadeInUp]>
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="email-icon">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        
        <h1>Vérifiez votre email</h1>
        <p class="subtitle">Nous avons envoyé un lien de vérification à</p>
        <p class="email">{{ userEmail }}</p>
        
        <div class="instructions">
          <p>Cliquez sur le lien dans l'email pour activer votre compte Sakane.</p>
          <p>Si vous ne voyez pas l'email, vérifiez votre dossier spam.</p>
        </div>
        
        <div class="actions">
          <button class="btn btn-primary" (click)="resendEmail()" [disabled]="resendCooldown > 0">
            <span *ngIf="resendCooldown === 0">Renvoyer l'email</span>
            <span *ngIf="resendCooldown > 0">Renvoyer dans {{ resendCooldown }}s</span>
          </button>
          
          <button class="btn btn-secondary" (click)="goToLogin()">
            Aller à la connexion
          </button>
        </div>
        
        <div class="help-text">
          <p>Vous n'avez pas reçu l'email ? 
            <a href="mailto:support@locaspace.com">Contactez le support</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verify-email-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .verify-email-card {
      background: white;
      border-radius: 1rem;
      padding: 3rem 2rem;
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
    }

    .icon-container {
      margin-bottom: 2rem;
    }

    .email-icon {
      color: #667eea;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .subtitle {
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .email {
      font-weight: 600;
      color: #667eea;
      font-size: 1.125rem;
      margin-bottom: 2rem;
    }

    .instructions {
      background: #f3f4f6;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      
      p {
        color: #4b5563;
        margin-bottom: 0.5rem;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-primary {
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      color: white;
      
      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgb(102 126 234 / 0.4);
      }
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      
      &:hover {
        background: #e5e7eb;
      }
    }

    .help-text {
      color: #6b7280;
      font-size: 0.875rem;
      
      a {
        color: #667eea;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    @media (min-width: 640px) {
      .actions {
        flex-direction: row;
        justify-content: center;
      }
    }

    :host-context(.dark-theme) {
      .verify-email-card {
        background: #1f2937;
      }

      h1 {
        color: #f3f4f6;
      }

      .instructions {
        background: #374151;
        
        p {
          color: #d1d5db;
        }
      }

      .btn-secondary {
        background: #374151;
        color: #f3f4f6;
        
        &:hover {
          background: #4b5563;
        }
      }

      .help-text {
        color: #9ca3af;
      }
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  userEmail = '';
  resendCooldown = 0;
  private cooldownInterval?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Get email from query params
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['email'] || 'votre-email@exemple.com';
    });
  }

  ngOnDestroy() {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  resendEmail() {
    if (this.resendCooldown > 0) return;

    // Simulate API call to resend verification email
    
    // Start cooldown
    this.resendCooldown = 60;
    this.cooldownInterval = window.setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }

  goToLogin() {
    this.router.navigate(['/login'], {
      queryParams: { 
        email: this.userEmail,
        message: 'verify-email'
      }
    });
  }
}