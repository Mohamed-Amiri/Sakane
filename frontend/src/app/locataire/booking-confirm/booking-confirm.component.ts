import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocatairesService, Place } from '../services/locataires.service';
import { ReservationService } from '../services/reservation.service';
import { AuthService } from '../../auth/auth.service';
import { AvailabilityService } from '../services/availability.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { MadCurrencyPipe } from '../../shared/pipes/mad-currency.pipe';

@Component({
    selector: 'app-booking-confirm',
    standalone: true,
    imports: [CommonModule, FormsModule, MadCurrencyPipe],
    templateUrl: './booking-confirm.component.html',
    styleUrls: ['./booking-confirm.component.scss']
})
export class BookingConfirmComponent implements OnInit {
    place: Place | null = null;
    checkInDate = '';
    checkOutDate = '';
    guests = 1;

    // Guest information
    guestName = '';
    guestEmail = '';
    guestPhone = '';
    specialRequests = '';
    phoneError = '';

    // Payment method is always on-site
    readonly paymentMethod = 'onsite';

    loading = false;
    isProcessing = false;
    currentStep = 1; // 1: Guest Info, 3: Confirmation (Payment step 2 removed)
    bookingNumber = ''; // Store booking number to avoid ExpressionChangedAfterItHasBeenCheckedError

    constructor(
        private route: ActivatedRoute,
        public router: Router, // Make router public for template access
        private reservationService: ReservationService,
        private locatairesService: LocatairesService,
        private cdr: ChangeDetectorRef,
        private authService: AuthService,
        private availabilityService: AvailabilityService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        // Initialize booking number once to avoid ExpressionChangedAfterItHasBeenCheckedError
        this.bookingNumber = '#' + Date.now().toString().slice(-6);

        // Prepopulate guest info if logged in
        if (this.authService.currentUser) {
            const u = this.authService.currentUser;
            this.guestName = [u.firstName, u.lastName].filter(Boolean).join(' ');
            this.guestEmail = u.email || '';
        }
        
        // Get booking data from route param and query params
        this.route.params.subscribe(params => {
            const placeId = Number(params['id']);
            if (placeId) {
                this.loading = true;
                this.locatairesService.getPlaceById(placeId).subscribe({
                    next: (place) => {
                        this.place = place;
                        this.loading = false;
                        
                        // Debug authentication status
                        this.cdr.detectChanges();
                    },
                    error: (error) => {
                        console.error('Error loading place details:', error);
                        this.loading = false;
                        this.router.navigate(['/locataire/search']);
                    }
                });
            } else {
                this.router.navigate(['/locataire/search']);
            }
        });

        this.route.queryParams.subscribe(params => {
            this.checkInDate = params['checkIn'] || '';
            this.checkOutDate = params['checkOut'] || '';
            this.guests = Number(params['guests']) || 1;
        });
    }

    calculateNights(): number {
        if (!this.checkInDate || !this.checkOutDate) return 0;

        const startDate = new Date(this.checkInDate);
        const endDate = new Date(this.checkOutDate);
        // Ensure start date is strictly after today to match backend rules
        const today = new Date();
        today.setHours(0,0,0,0);
        if (startDate <= today) {
            this.isProcessing = false;
            this.toastService.error('La date d\'arrivée doit être postérieure à aujourd\'hui');
            return 0;
        }
        const timeDiff = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    calculateTotalPrice(): number {
        if (!this.place) return 0;
        return this.place.price * this.calculateNights();
    }

    get subtotal(): number {
        if (!this.place) return 0;
        return this.place.price * this.calculateNights();
    }

    get serviceFee(): number {
        return 0;
    }

    get taxes(): number {
        return 0;
    }

    nextStep(): void {
        if (!this.guestName || !this.guestEmail) {
            this.toastService.error('Veuillez remplir les informations obligatoires');
            return;
        }
        this.confirmBooking();
    }

    previousStep(): void {
        this.router.navigate(['/locataire/search']);
    }

    skipPayment(): void {
        this.confirmBooking();
    }

    confirmBooking(): void {
        if (!this.place) return;

        // Check authentication status with detailed logging
        if (!this.checkAuthenticationStatus()) {
            this.toastService.error('Vous devez être connecté pour effectuer une réservation. Veuillez vous reconnecter.');
            this.router.navigate(['/auth/login'], {
                queryParams: { returnUrl: this.router.url }
            });
            return;
        }

        this.isProcessing = true;

        const startDate = new Date(this.checkInDate);
        const endDate = new Date(this.checkOutDate);
        const totalPrice = this.calculateTotalPrice();

        // Additional validation for dates
        if (startDate >= endDate) {
            this.isProcessing = false;
            this.toastService.error('La date de départ doit être postérieure à la date d\'arrivée');
            return;
        }

        const today = new Date();
        today.setHours(0,0,0,0);
        if (startDate <= today) {
            this.isProcessing = false;
            this.toastService.error('La date d\'arrivée doit être postérieure à aujourd\'hui');
            return;
        }


        // Verify availability before submission
        this.availabilityService.getAvailability(this.place.id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
            next: (res) => {
                const unavailableDates = res.unavailableDates || [];
                let current = new Date(startDate);
                let hasConflict = false;
                while (current < endDate) {
                    if (unavailableDates.includes(current.toISOString().split('T')[0])) {
                        hasConflict = true;
                        break;
                    }
                    current.setDate(current.getDate() + 1);
                }

                if (hasConflict) {
                    this.isProcessing = false;
                    this.toastService.error('Ces dates ne sont plus disponibles');
                    this.router.navigate(['/locataire/place', this.place!.id]);
                    return;
                }

                this.executeBooking(startDate, endDate, totalPrice);
            },
            error: (err) => {
                this.isProcessing = false;
                this.toastService.error('Erreur lors de la vérification des disponibilités');
            }
        });
    }

    private executeBooking(startDate: Date, endDate: Date, totalPrice: number): void {
        this.reservationService.createBooking({
            place: this.place!,
            startDate,
            endDate,
            guests: this.guests,
            totalPrice,
            guestInfo: {
                name: this.guestName,
                email: this.guestEmail,
                phone: this.guestPhone,
                specialRequests: this.specialRequests
            },
            paymentMethod: this.paymentMethod
        }).subscribe({
            next: (booking) => {
                this.isProcessing = false;
                // Defer step change to next tick to avoid NG0100
                setTimeout(() => {
                    this.currentStep = 3;
                    this.cdr.detectChanges();
                }, 0);

                // Redirect to reservations after 3 seconds
                setTimeout(() => {
                    this.router.navigate(['/locataire/reservations']);
                }, 3000);
            },
            error: (error) => {
                this.isProcessing = false;
                console.error('Erreur lors de la réservation:', error);
                
                // More specific error handling
                if (error.status === 401) {
                    this.toastService.error('Votre session a expiré. Veuillez vous reconnecter.');
                    this.router.navigate(['/auth/login'], {
                        queryParams: { returnUrl: this.router.url }
                    });
                } else if (error.status === 400) {
                    const errorMsg = error.error?.message || error.message || 'Données invalides';
                    this.toastService.error(`Erreur de validation: ${errorMsg}. Vérifiez les dates et les informations saisies.`);
                } else if (error.status === 409) {
                    this.toastService.error('Ces dates ne sont pas disponibles. Veuillez choisir d\'autres dates.');
                } else if (error.status === 500) {
                    this.toastService.error('Erreur serveur. Veuillez réessayer plus tard ou contactez le support.');
                } else {
                    const errorMsg = error.message || 'Erreur inconnue';
                    this.toastService.error(`Erreur lors de la création de la réservation: ${errorMsg}`);
                }
            }
        });
    }

    goBack(): void {
        if (this.place) {
            this.router.navigate(['/locataire/place', this.place.id]);
        } else {
            this.router.navigate(['/locataire/search']);
        }
    }

    validatePhone(): void {
        const moroccanPattern = /^(\+212|0)(6|7)\d{8}$/;
        if (this.guestPhone && !moroccanPattern.test(this.guestPhone.replace(/\s/g, ''))) {
            this.phoneError = 'Format invalide. Exemple: +212 6 12 34 56 78';
        } else {
            this.phoneError = '';
        }
    }

    formatDate(dateString: string): string {
        if (!dateString) return '';
        const d = new Date(dateString);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    getAmenityIcon(amenity: string): string {
        const icons: { [key: string]: string } = {
            'WiFi': '📶',
            'Parking': '🚗',
            'Piscine': '🏊',
            'Climatisation': '❄️',
            'Cuisine équipée': '🍳',
            'Balcon': '🏡',
            'Jardin': '🌿',
            'Salle de sport': '💪',
            'Machine à laver': '🧺',
            'Télévision': '📺',
            'Chauffage': '🔥'
        };
        return icons[amenity] || '✨';
    }

    getBookingNumber(): string {
        // Return the pre-generated booking number to avoid ExpressionChangedAfterItHasBeenCheckedError
        return this.bookingNumber;
    }

    navigateToReservations(): void {
        this.router.navigate(['/locataire/reservations']);
    }

    checkAuthenticationStatus(): boolean {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const user = this.authService.currentUser;
        const isAuthenticated = this.authService.isAuthenticated;
        
        
        return isAuthenticated && !!token && !!user;
    }
}