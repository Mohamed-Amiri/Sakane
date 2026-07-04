import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProprietairesService, BookingRequest } from '../services/proprietaires.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MadCurrencyPipe } from '../../shared/pipes/mad-currency.pipe';

@Component({
  selector: 'app-booking-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MadCurrencyPipe
  ],
  templateUrl: './booking-requests.component.html',
  styleUrls: ['./booking-requests.component.scss']
})
export class BookingRequestsComponent implements OnInit {
  allRequests: BookingRequest[] = [];
  pendingRequests: BookingRequest[] = [];
  approvedRequests: BookingRequest[] = [];
  rejectedRequests: BookingRequest[] = [];
  loading = true;
  activeTab: number = 0;

  // Inline rejection form state
  showRejectionInput: { [requestId: number]: boolean } = {};
  rejectionReasons: { [requestId: number]: string } = {};

  constructor(
    private proprietairesService: ProprietairesService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBookingRequests();
  }

  setTab(index: number): void {
    this.activeTab = index;
  }

  isTab(n: number): boolean {
    return this.activeTab === n;
  }

  loadBookingRequests(): void {
    this.loading = true;
    
    this.proprietairesService.getBookingRequests()
      .pipe(
        catchError((error) => {
          console.error('Error loading booking requests:', error);
          
          let errorMessage = 'Erreur lors du chargement des demandes';
          if (error.status === 401) {
            errorMessage = 'Non autorisé - Veuillez vous reconnecter';
          } else if (error.status === 403) {
            errorMessage = 'Accès refusé - Vérifiez vos permissions';
          } else if (error.status === 404) {
            errorMessage = 'Endpoint non trouvé';
          } else if (error.status === 0) {
            errorMessage = 'Erreur de connexion au serveur';
          }
          
          this.toastService.error(errorMessage);
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((requests) => {
        this.allRequests = requests || [];
        this.categorizeRequests();
        
        if (this.allRequests.length === 0) {
          this.toastService.info('Aucune demande de réservation trouvée');
        }
      });
  }

  private categorizeRequests(): void {
    this.pendingRequests = this.allRequests.filter(r => r.status === 'pending');
    this.approvedRequests = this.allRequests.filter(r => r.status === 'approved');
    this.rejectedRequests = this.allRequests.filter(r => r.status === 'rejected');
  }

  respondToRequest(request: BookingRequest, response: 'approved' | 'rejected', message?: string): void {
    this.proprietairesService.respondToBookingRequest(request.id, response, message).subscribe({
      next: (updatedRequest) => {
        const index = this.allRequests.findIndex(r => r.id === request.id);
        if (index >= 0) {
          this.allRequests[index] = updatedRequest;
        }
        
        this.categorizeRequests();
        
        const action = response === 'approved' ? 'acceptée' : 'refusée';
        this.toastService.success(`Demande ${action} avec succès`);
      },
      error: (error) => {
        console.error('Error responding to booking request:', error);
        const action = response === 'approved' ? 'accepter' : 'refuser';
        this.toastService.error(`Erreur lors de ${action} la demande. Veuillez réessayer.`);
      }
    });
  }

  approveRequest(request: BookingRequest): void {
    this.respondToRequest(request, 'approved');
  }

  rejectRequest(request: BookingRequest): void {
    this.startRejection(request.id);
  }

  startRejection(requestId: number): void {
    this.showRejectionInput[requestId] = true;
    this.rejectionReasons[requestId] = '';
  }

  cancelRejection(requestId: number): void {
    this.showRejectionInput[requestId] = false;
  }

  confirmRejection(request: BookingRequest): void {
    const reason = this.rejectionReasons[request.id] || 'Aucune raison spécifiée';
    this.respondToRequest(request, 'rejected', reason);
    this.showRejectionInput[request.id] = false;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Acceptée';
      case 'rejected': return 'Refusée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return 'clock';
      case 'approved': return 'check-circle';
      case 'rejected': return 'times-circle';
      case 'cancelled': return 'ban';
      default: return 'question-circle';
    }
  }

  calculateNights(checkIn: Date, checkOut: Date): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}