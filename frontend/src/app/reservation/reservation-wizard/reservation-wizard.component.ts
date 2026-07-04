import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LieuService } from '../../lieux/lieu.service';
import { ReservationStorageService } from '../reservation-storage.service';
import { fadeInUpAnimation } from '../../shared/animations/fade.animation';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormFieldComponent } from '../../shared/components/form/form-field.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { MadCurrencyPipe } from '../../shared/pipes/mad-currency.pipe';

interface ReservationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

@Component({
  selector: 'app-reservation-wizard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    FormFieldComponent,
    MadCurrencyPipe
  ],
  animations: [fadeInUpAnimation],
  template: `
    <div class="reservation-wizard" [@fadeInUp]>
      <!-- Stepper Header -->
      <div class="stepper-header">
        <div class="container">
          <div class="stepper">
            <div 
              *ngFor="let step of steps; let i = index"
              class="step"
              [class.completed]="step.completed"
              [class.active]="step.active">
              <div class="step-circle">
                <span *ngIf="!step.completed">{{ step.id }}</span>
                <svg *ngIf="step.completed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div class="step-content">
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </div>
              <div *ngIf="i < steps.length - 1" class="step-connector"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="wizard-content">
        <div class="container">
          <div class="wizard-layout">
            <!-- Main Content -->
            <div class="wizard-main">
              <!-- Step 1: Dates & Guests -->
              <div *ngIf="currentStep === 1" class="step-content" [@fadeInUp]>
                <h2>Choisissez vos dates</h2>
                <form [formGroup]="datesForm" class="dates-form">
                  <div class="date-fields">
                    <app-form-field label="Date d'arrivée" inputId="startDate" [required]="true">
                      <input
                        id="startDate"
                        type="date"
                        formControlName="startDate"
                        [min]="minDate">
                    </app-form-field>
                    
                    <app-form-field label="Date de départ" inputId="endDate" [required]="true">
                      <input
                        id="endDate"
                        type="date"
                        formControlName="endDate"
                        [min]="datesForm.get('startDate')?.value || minDate">
                    </app-form-field>
                  </div>
                  
                  <app-form-field label="Nombre d'invités" inputId="guests" [required]="true">
                    <select id="guests" formControlName="guests">
                      <option value="">Sélectionnez</option>
                      <option *ngFor="let i of guestOptions" [value]="i">{{ i }} {{ i === 1 ? 'invité' : 'invités' }}</option>
                    </select>
                  </app-form-field>
                </form>
              </div>

              <!-- Step 2: Personal Information -->
              <div *ngIf="currentStep === 2" class="step-content" [@fadeInUp]>
                <h2>Vos informations</h2>
                <form [formGroup]="personalForm" class="personal-form">
                  <div class="name-fields">
                    <app-form-field label="Prénom" inputId="firstName" [required]="true">
                      <input
                        id="firstName"
                        type="text"
                        formControlName="firstName"
                        placeholder="Votre prénom">
                    </app-form-field>
                    
                    <app-form-field label="Nom" inputId="lastName" [required]="true">
                      <input
                        id="lastName"
                        type="text"
                        formControlName="lastName"
                        placeholder="Votre nom">
                    </app-form-field>
                  </div>
                  
                  <app-form-field label="Email" inputId="email" [required]="true">
                    <input
                      id="email"
                      type="email"
                      formControlName="email"
                      placeholder="votre@email.com">
                  </app-form-field>
                  
                  <app-form-field label="Téléphone" inputId="phone" [required]="true">
                    <input
                      id="phone"
                      type="tel"
                      formControlName="phone"
                      placeholder="+33 6 12 34 56 78">
                  </app-form-field>
                  
                  <app-form-field label="Message pour l'hôte" inputId="message">
                    <textarea
                      id="message"
                      formControlName="message"
                      rows="4"
                      placeholder="Décrivez votre événement ou posez vos questions..."></textarea>
                  </app-form-field>
                </form>
              </div>

              <!-- Step 3: Payment -->
              <div *ngIf="currentStep === 3" class="step-content" [@fadeInUp]>
                <h2>Paiement sécurisé</h2>
                <form [formGroup]="paymentForm" class="payment-form">
                  <div class="payment-methods">
                    <label class="payment-method" [class.selected]="paymentForm.get('method')?.value === 'card'">
                      <input type="radio" formControlName="method" value="card">
                      <div class="method-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                          <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                        <span>Carte bancaire</span>
                      </div>
                    </label>
                    
                    <label class="payment-method" [class.selected]="paymentForm.get('method')?.value === 'paypal'">
                      <input type="radio" formControlName="method" value="paypal">
                      <div class="method-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                          <path d="M2 17l10 5 10-5"/>
                          <path d="M2 12l10 5 10-5"/>
                        </svg>
                        <span>PayPal</span>
                      </div>
                    </label>
                  </div>

                  <div *ngIf="paymentForm.get('method')?.value === 'card'" class="card-form">
                    <app-form-field label="Numéro de carte" inputId="cardNumber" [required]="true">
                      <input
                        id="cardNumber"
                        type="text"
                        formControlName="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        maxlength="19">
                    </app-form-field>
                    
                    <div class="card-details">
                      <app-form-field label="MM/AA" inputId="expiry" [required]="true">
                        <input
                          id="expiry"
                          type="text"
                          formControlName="expiry"
                          placeholder="12/25"
                          maxlength="5">
                      </app-form-field>
                      
                      <app-form-field label="CVC" inputId="cvc" [required]="true">
                        <input
                          id="cvc"
                          type="text"
                          formControlName="cvc"
                          placeholder="123"
                          maxlength="4">
                      </app-form-field>
                    </div>
                    
                    <app-form-field label="Nom sur la carte" inputId="cardName" [required]="true">
                      <input
                        id="cardName"
                        type="text"
                        formControlName="cardName"
                        placeholder="Jean Dupont">
                    </app-form-field>
                  </div>
                </form>
              </div>

              <!-- Step 4: Confirmation -->
              <div *ngIf="currentStep === 4" class="step-content confirmation" [@fadeInUp]>
                <div class="success-animation">
                  <div class="checkmark">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                </div>
                <h2>Réservation confirmée !</h2>
                <p>Votre réservation a été confirmée avec succès. Vous recevrez un email de confirmation dans quelques minutes.</p>
                
                <div class="confirmation-details">
                  <h3>Détails de votre réservation</h3>
                  <div class="detail-row">
                    <span>Numéro de réservation:</span>
                    <strong>#{{ reservationNumber }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Dates:</span>
                    <strong>{{ formatDate(datesForm.get('startDate')?.value) }} - {{ formatDate(datesForm.get('endDate')?.value) }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Invités:</span>
                    <strong>{{ datesForm.get('guests')?.value }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Total payé:</span>
                    <strong>{{ totalPrice | madCurrency }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sticky Summary -->
            <div class="reservation-summary">
              <div class="summary-card">
                <div class="lieu-info" *ngIf="lieu">
                  <img [src]="lieu.photos[0]" [alt]="lieu.titre">
                  <div class="lieu-details">
                    <h3>{{ lieu.titre }}</h3>
                    <p>{{ lieu.ville }}</p>
                    <div class="rating">
                      <span class="stars">★★★★★</span>
                      <span class="rating-value">{{ lieu.note }}</span>
                    </div>
                  </div>
                </div>

                <div class="price-breakdown" *ngIf="currentStep > 1">
                  <h4>Détail des prix</h4>
                  <div class="price-row">
                    <span>{{ lieu?.prix | madCurrency }} x {{ totalNights }} jours</span>
                    <span>{{ basePrice | madCurrency }}</span>
                  </div>
                  <div class="price-row">
                    <span>Frais de service</span>
                    <span>{{ serviceFee | madCurrency }}</span>
                  </div>
                  <div class="price-row">
                    <span>Taxes</span>
                    <span>{{ taxes | madCurrency }}</span>
                  </div>
                  <hr>
                  <div class="price-row total">
                    <span>Total</span>
                    <span>{{ totalPrice | madCurrency }}</span>
                  </div>
                </div>

                <div class="summary-actions" *ngIf="currentStep < 4">
                  <app-button
                    *ngIf="currentStep > 1"
                    variant="ghost"
                    (buttonClick)="previousStep()"
                    class="btn-back">
                    Retour
                  </app-button>
                  
                  <app-button
                    variant="primary"
                    [loading]="isProcessing"
                    [disabled]="!canProceed()"
                    (buttonClick)="nextStep()"
                    class="btn-next">
                    {{ currentStep === 3 ? 'Confirmer et payer' : 'Continuer' }}
                  </app-button>
                </div>

                <div class="summary-actions" *ngIf="currentStep === 4">
                  <app-button
                    variant="primary"
                    routerLink="/locataire"
                    class="btn-dashboard">
                    Voir mes réservations
                  </app-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./reservation-wizard.component.scss']
})
export class ReservationWizardComponent implements OnInit, OnDestroy {
  currentStep = 1;
  lieu: any;
  reservationNumber = '';
  isProcessing = false;
  
  steps: ReservationStep[] = [
    { id: 1, title: 'Dates', description: 'Choisissez vos dates', completed: false, active: true },
    { id: 2, title: 'Informations', description: 'Vos coordonnées', completed: false, active: false },
    { id: 3, title: 'Paiement', description: 'Paiement sécurisé', completed: false, active: false },
    { id: 4, title: 'Confirmation', description: 'Réservation confirmée', completed: false, active: false }
  ];

  datesForm: FormGroup;
  personalForm: FormGroup;
  paymentForm: FormGroup;

  minDate = new Date().toISOString().split('T')[0];
  guestOptions = Array.from({length: 20}, (_, i) => i + 1);

  private autoSaveInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private lieuService: LieuService,
    private storageService: ReservationStorageService,
    private toastService: ToastService
  ) {
    this.datesForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      guests: ['', Validators.required]
    });

    this.personalForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      message: ['']
    });

    this.paymentForm = this.fb.group({
      method: ['card', Validators.required],
      cardNumber: [''],
      expiry: [''],
      cvc: [''],
      cardName: ['']
    });
  }

  ngOnInit() {
    const lieuId = this.route.snapshot.paramMap.get('id');
    if (lieuId) {
      this.lieu = this.lieuService.getLieuById(+lieuId);
      this.loadSavedData(+lieuId);
      this.startAutoSave(+lieuId);
    }

    // Load dates from query params
    this.route.queryParams.subscribe(params => {
      if (params['start'] && params['end']) {
        this.datesForm.patchValue({
          startDate: new Date(params['start']).toISOString().split('T')[0],
          endDate: new Date(params['end']).toISOString().split('T')[0]
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  loadSavedData(lieuId: number) {
    const saved = this.storageService.load(lieuId);
    if (saved) {
      this.currentStep = saved.currentStep || 1;
      this.datesForm.patchValue(saved.dates || {});
      this.personalForm.patchValue(saved.personal || {});
      this.updateSteps();
    }
  }

  startAutoSave(lieuId: number) {
    this.autoSaveInterval = setInterval(() => {
      this.saveProgress(lieuId);
    }, 30000); // Save every 30 seconds
  }

  saveProgress(lieuId: number) {
    const data = {
      currentStep: this.currentStep,
      dates: this.datesForm.value,
      personal: this.personalForm.value
    };
    this.storageService.save(lieuId, data);
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.datesForm.valid;
      case 2:
        return this.personalForm.valid;
      case 3:
        return this.paymentForm.valid;
      default:
        return false;
    }
  }

  nextStep() {
    if (!this.canProceed()) return;

    if (this.currentStep === 3) {
      this.processPayment();
    } else {
      this.currentStep++;
      this.updateSteps();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateSteps();
    }
  }

  updateSteps() {
    this.steps.forEach((step, index) => {
      step.completed = index < this.currentStep - 1;
      step.active = index === this.currentStep - 1;
    });
  }

  processPayment() {
    this.isProcessing = true;
    
    // Simulate payment processing
    setTimeout(() => {
      this.reservationNumber = 'RES' + Date.now().toString().slice(-6);
      this.currentStep = 4;
      this.updateSteps();
      this.isProcessing = false;
      
      // Clear saved data
      if (this.lieu) {
        this.storageService.clear(this.lieu.id);
      }
      
      this.toastService.success('Paiement effectué avec succès !');
    }, 2000);
  }

  get totalNights(): number {
    const start = this.datesForm.get('startDate')?.value;
    const end = this.datesForm.get('endDate')?.value;
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  get basePrice(): number {
    return this.lieu ? this.lieu.prix * this.totalNights : 0;
  }

  get serviceFee(): number {
    return Math.round(this.basePrice * 0.1);
  }

  get taxes(): number {
    return Math.round(this.basePrice * 0.05);
  }

  get totalPrice(): number {
    return this.basePrice + this.serviceFee + this.taxes;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
}