import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, switchMap } from 'rxjs/operators';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer' | 'apple_pay' | 'google_pay';
  name: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  email?: string; // For PayPal
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
  metadata: {
    bookingId: string;
    lieuId: string;
    guestId: string;
    hostId: string;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId: string;
  error?: string;
  transactionId?: string;
}

export interface BookingPayment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  paymentMethod: PaymentMethod;
  transactionId: string;
  createdAt: Date;
  completedAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  fees: {
    serviceFee: number;
    hostFee: number;
    taxes: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      name: 'Visa se terminant par 4242',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: '2',
      type: 'card',
      name: 'Mastercard se terminant par 5555',
      last4: '5555',
      brand: 'mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false
    },
    {
      id: '3',
      type: 'paypal',
      name: 'PayPal',
      email: 'user@example.com',
      isDefault: false
    }
  ];

  constructor() {}

  // Payment Methods Management
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return of(this.paymentMethods).pipe(delay(300));
  }

  addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): Observable<PaymentMethod> {
    const newMethod: PaymentMethod = {
      ...paymentMethod,
      id: Date.now().toString()
    };

    // If this is set as default, unset others
    if (newMethod.isDefault) {
      this.paymentMethods = this.paymentMethods.map(pm => ({ ...pm, isDefault: false }));
    }

    this.paymentMethods.push(newMethod);
    return of(newMethod).pipe(delay(500));
  }

  updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Observable<PaymentMethod> {
    const index = this.paymentMethods.findIndex(pm => pm.id === id);
    if (index === -1) {
      return throwError(() => new Error('Payment method not found'));
    }

    // If setting as default, unset others
    if (updates.isDefault) {
      this.paymentMethods = this.paymentMethods.map(pm => ({ ...pm, isDefault: false }));
    }

    this.paymentMethods[index] = { ...this.paymentMethods[index], ...updates };
    return of(this.paymentMethods[index]).pipe(delay(300));
  }

  deletePaymentMethod(id: string): Observable<void> {
    const index = this.paymentMethods.findIndex(pm => pm.id === id);
    if (index === -1) {
      return throwError(() => new Error('Payment method not found'));
    }

    const wasDefault = this.paymentMethods[index].isDefault;
    this.paymentMethods.splice(index, 1);

    // If deleted method was default, set first remaining as default
    if (wasDefault && this.paymentMethods.length > 0) {
      this.paymentMethods[0].isDefault = true;
    }

    return of(void 0).pipe(delay(300));
  }

  setDefaultPaymentMethod(id: string): Observable<void> {
    this.paymentMethods = this.paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    }));
    return of(void 0).pipe(delay(200));
  }

  // Payment Processing
  createPaymentIntent(
    amount: number,
    currency: string = 'MAD',
    metadata: PaymentIntent['metadata']
  ): Observable<PaymentIntent> {
    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}`,
      amount,
      currency,
      status: 'requires_payment_method',
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      metadata
    };

    return of(paymentIntent).pipe(delay(500));
  }

  confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Observable<PaymentResult> {
    // Simulate payment processing
    return of({
      success: Math.random() > 0.1, // 90% success rate
      paymentIntentId,
      transactionId: `txn_${Date.now()}`,
      error: Math.random() > 0.9 ? 'Your card was declined' : undefined
    }).pipe(delay(2000)); // Simulate processing time
  }

  processPayment(
    amount: number,
    paymentMethodId: string,
    bookingData: {
      bookingId: string;
      lieuId: string;
      guestId: string;
      hostId: string;
    }
  ): Observable<PaymentResult> {
    return this.createPaymentIntent(amount, 'MAD', bookingData).pipe(
      switchMap(paymentIntent => this.confirmPayment(paymentIntent.id, paymentMethodId))
    );
  }

  // Booking Payments
  getBookingPayment(bookingId: string): Observable<BookingPayment | null> {
    // TODO: Implement real API call
    return of(null).pipe(delay(300));
  }

  getPaymentHistory(): Observable<BookingPayment[]> {
    // TODO: Implement real API call
    return of([]).pipe(delay(400));
  }

  // Refunds
  requestRefund(
    paymentId: string,
    amount: number,
    reason: string
  ): Observable<{ success: boolean; refundId?: string; error?: string }> {
    // Simulate refund processing
    const success = Math.random() > 0.05; // 95% success rate
    
    if (success) {
      return of({
        success: true,
        refundId: `re_${Date.now()}`
      }).pipe(delay(1500));
    } else {
      return of({
        success: false,
        error: 'Refund could not be processed at this time'
      }).pipe(delay(1500));
    }
  }

  // Price Calculation
  calculateBookingPrice(basePrice: number, nights: number): {
    baseAmount: number;
    serviceFee: number;
    taxes: number;
    total: number;
  } {
    const baseAmount = basePrice * nights;
    const serviceFee = Math.max(50, Math.round(baseAmount * 0.14)); // 14% service fee, minimum 50 DH
    const taxes = Math.round(baseAmount * 0.055); // 5.5% taxes
    const total = baseAmount + serviceFee + taxes;

    return {
      baseAmount,
      serviceFee,
      taxes,
      total
    };
  }

  // Payment Validation
  validateCardNumber(cardNumber: string): boolean {
    // Basic Luhn algorithm validation
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  validateExpiryDate(month: number, year: number): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    if (month < 1 || month > 12) return false;

    return true;
  }

  validateCVV(cvv: string, cardType: string = 'visa'): boolean {
    const digits = cvv.replace(/\D/g, '');
    const expectedLength = cardType === 'amex' ? 4 : 3;
    return digits.length === expectedLength;
  }

  getCardBrand(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^6(?:011|5)/.test(digits)) return 'discover';
    
    return 'unknown';
  }

  // Secure payment processing simulation
  processSecurePayment(paymentData: {
    amount: number;
    paymentMethodId: string;
    billingAddress: {
      name: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
    bookingId: string;
  }): Observable<PaymentResult> {
    // Simulate 3D Secure or other authentication if needed
    const requires3DS = Math.random() > 0.8; // 20% chance

    if (requires3DS) {
      // Simulate 3D Secure flow
      return of({
        success: false,
        paymentIntentId: `pi_${Date.now()}`,
        error: 'requires_authentication'
      }).pipe(delay(1000));
    }

    // Process normal payment
    return this.processPayment(
      paymentData.amount,
      paymentData.paymentMethodId,
      {
        bookingId: paymentData.bookingId,
        lieuId: '1',
        guestId: 'guest_1',
        hostId: 'host_1'
      }
    );
  }

  // Apple Pay / Google Pay simulation
  processDigitalWalletPayment(
    walletType: 'apple_pay' | 'google_pay',
    amount: number,
    bookingId: string
  ): Observable<PaymentResult> {
    // Simulate digital wallet payment
    return of({
      success: Math.random() > 0.05, // 95% success rate
      paymentIntentId: `pi_${Date.now()}`,
      transactionId: `${walletType}_${Date.now()}`,
      error: Math.random() > 0.95 ? 'Digital wallet payment failed' : undefined
    }).pipe(delay(1500));
  }
}