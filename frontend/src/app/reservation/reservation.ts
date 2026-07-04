import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LieuService } from '../lieux/lieu.service';
import { Lieu } from '../lieux/lieu.model';
import { ReservationStorageService } from './reservation-storage.service';
import { PaymentService } from '../shared/payment/payment.service';
import { NotificationService } from '../shared/notifications/notification.service';
import { ToastService } from '../shared/components/toast/toast.service';
import { MadCurrencyPipe } from '../shared/pipes/mad-currency.pipe';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MadCurrencyPipe],
  templateUrl: './reservation.html',
  styleUrls: ['./reservation.scss']
})
export class ReservationComponent implements OnInit {
  lieu: Lieu | undefined;
  reservationForm!: FormGroup;
  currentStep: 'details' | 'payment' | 'confirmation' = 'details';
  startDate: Date | null = null;
  endDate: Date | null = null;
  nights = 0;
  processing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lieuService: LieuService,
    private fb: FormBuilder,
    private storage: ReservationStorageService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.lieu = this.lieuService.getLieuById(+id);
    }

    // Retrieve dates from query params (ISO strings)
    const startParam = this.route.snapshot.queryParamMap.get('start');
    const endParam = this.route.snapshot.queryParamMap.get('end');
    if (startParam && endParam) {
      this.startDate = new Date(startParam);
      this.endDate = new Date(endParam);
      this.calculateNights();
    }

    this.reservationForm = this.fb.group({
      personalInfo: this.fb.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      }),
      paymentInfo: this.fb.group({
        cardNumber: ['', Validators.required],
        expiryDate: ['', Validators.required],
        cvv: ['', Validators.required]
      })
    });

    // load draft
    const draft = this.storage.load(this.lieu?.id || 0);
    if(draft){ this.reservationForm.patchValue(draft.form); this.currentStep=draft.step; }

    // autosave
    this.reservationForm.valueChanges.subscribe(val=>{
      this.storage.save(this.lieu?.id||0,{form:this.reservationForm.value, step:this.currentStep});
    });
  }

  nextStep(): void {
    if (this.currentStep === 'details') {
      this.currentStep = 'payment';
    } else if (this.currentStep === 'payment') {
      this.processPayment();
    }
  }

  previousStep(): void {
    if (this.currentStep === 'payment') {
      this.currentStep = 'details';
    }
  }

  private calculateNights(): void {
    if (this.startDate && this.endDate) {
      const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
      this.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      this.nights = 0;
    }
  }

  private processPayment(): void {
    if (!this.lieu || !this.reservationForm.valid) {
      this.toastService.error('Veuillez remplir tous les champs requis');
      return;
    }

    this.processing = true;
    const pricing = this.paymentService.calculateBookingPrice(this.lieu.prix, this.nights);

    // Simulate payment processing
    this.paymentService.processSecurePayment({
      amount: pricing.total,
      paymentMethodId: 'pm_card_visa',
      billingAddress: {
        name: this.reservationForm.get('personalInfo.fullName')?.value,
        address: '123 Rue Example',
        city: 'Paris',
        postalCode: '75001',
        country: 'FR'
      },
      bookingId: `booking_${Date.now()}`
    }).subscribe({
      next: (result) => {
        if (result.success) {
          this.currentStep = 'confirmation';
          this.storage.clear(this.lieu?.id || 0);
          this.toastService.success('Réservation confirmée avec succès !');
          
          // Notification handled by backend

        } else {
          this.toastService.error(result.error || 'Erreur lors du paiement');
        }
        this.processing = false;
      },
      error: (error) => {
        this.toastService.error('Erreur lors du traitement du paiement');
        this.processing = false;
      }
    });
  }

  get totalPrice(): number {
    if (!this.lieu) return 0;
    return this.paymentService.calculateBookingPrice(this.lieu.prix, this.nights).total;
  }

  get priceBreakdown() {
    if (!this.lieu) return null;
    return this.paymentService.calculateBookingPrice(this.lieu.prix, this.nights);
  }
}
