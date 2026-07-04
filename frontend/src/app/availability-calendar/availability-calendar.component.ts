import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-availability-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="availability-calendar">
      <div class="calendar-header">
        <div class="header-content">
          <h1>Calendrier de disponibilité</h1>
          <p>Gérez les disponibilités de vos espaces</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="addAvailability()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Ajouter disponibilité
          </button>
        </div>
      </div>

      <!-- Property Selector -->
      <div class="property-selector">
        <label for="property">Sélectionner un espace :</label>
        <select id="property" [(ngModel)]="selectedProperty" (change)="onPropertyChange()">
          <option value="">Choisir un espace</option>
          <option *ngFor="let property of properties" [value]="property.id">
            {{ property.name }}
          </option>
        </select>
      </div>

      <!-- Calendar View -->
      <div class="calendar-container" *ngIf="selectedProperty">
        <div class="calendar-controls">
          <button class="btn-secondary" (click)="previousMonth()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
          <h2>{{ currentMonthName }} {{ currentYear }}</h2>
          <button class="btn-secondary" (click)="nextMonth()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>
        </div>

        <div class="calendar-grid">
          <div class="calendar-header-row">
            <div class="calendar-cell header">Lun</div>
            <div class="calendar-cell header">Mar</div>
            <div class="calendar-cell header">Mer</div>
            <div class="calendar-cell header">Jeu</div>
            <div class="calendar-cell header">Ven</div>
            <div class="calendar-cell header">Sam</div>
            <div class="calendar-cell header">Dim</div>
          </div>

          <div class="calendar-row" *ngFor="let week of calendarWeeks">
            <div 
              class="calendar-cell" 
              *ngFor="let day of week"
              [class.other-month]="day.otherMonth"
              [class.today]="day.isToday"
              [class.available]="day.available"
              [class.unavailable]="day.unavailable"
              [class.booked]="day.booked"
              (click)="toggleAvailability(day)"
              [title]="getDayTooltip(day)">
              <span class="day-number">{{ day.dayNumber }}</span>
              <div class="day-status" *ngIf="day.available || day.unavailable || day.booked">
                <span class="status-dot" [class]="getStatusClass(day)"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Availability Summary -->
      <div class="availability-summary" *ngIf="selectedProperty">
        <h3>Résumé des disponibilités</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-icon available">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
            <div class="summary-content">
              <h4>{{ availabilitySummary.available }}</h4>
              <p>Jours disponibles</p>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon unavailable">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <div class="summary-content">
              <h4>{{ availabilitySummary.unavailable }}</h4>
              <p>Jours indisponibles</p>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon booked">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="summary-content">
              <h4>{{ availabilitySummary.booked }}</h4>
              <p>Jours réservés</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions" *ngIf="selectedProperty">
        <h3>Actions rapides</h3>
        <div class="actions-grid">
          <button class="action-btn" (click)="setAvailable()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
            Marquer comme disponible
          </button>
          <button class="action-btn" (click)="setUnavailable()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Marquer comme indisponible
          </button>
          <button class="action-btn" (click)="exportCalendar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exporter calendrier
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .availability-calendar {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 1.875rem;
      font-weight: 700;
      color: #1f2937;
    }

    .header-content p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .property-selector {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .property-selector label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .property-selector select {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
      background: white;
    }

    .calendar-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .calendar-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .calendar-controls h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .calendar-grid {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .calendar-header-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #f9fafb;
    }

    .calendar-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      border-top: 1px solid #e5e7eb;
    }

    .calendar-cell {
      padding: 12px;
      border-right: 1px solid #e5e7eb;
      min-height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
    }

    .calendar-cell:last-child {
      border-right: none;
    }

    .calendar-cell.header {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
      text-align: center;
      cursor: default;
      min-height: auto;
    }

    .calendar-cell.other-month {
      color: #9ca3af;
      background: #f9fafb;
    }

    .calendar-cell.today {
      background: rgba(59, 130, 246, 0.1);
      font-weight: 600;
    }

    .calendar-cell.available {
      background: rgba(16, 185, 129, 0.1);
    }

    .calendar-cell.unavailable {
      background: rgba(239, 68, 68, 0.1);
    }

    .calendar-cell.booked {
      background: rgba(245, 158, 11, 0.1);
    }

    .calendar-cell:hover:not(.header) {
      background: rgba(59, 130, 246, 0.05);
    }

    .day-number {
      font-weight: 500;
      color: #1f2937;
    }

    .day-status {
      display: flex;
      justify-content: center;
      margin-top: 4px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-dot.available {
      background: #10b981;
    }

    .status-dot.unavailable {
      background: #ef4444;
    }

    .status-dot.booked {
      background: #f59e0b;
    }

    .availability-summary {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .availability-summary h3 {
      margin: 0 0 24px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .summary-icon {
      margin-right: 16px;
      padding: 8px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .summary-icon.available {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .summary-icon.unavailable {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .summary-icon.booked {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .summary-content h4 {
      margin: 0 0 4px 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .summary-content p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .quick-actions {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .quick-actions h3 {
      margin: 0 0 24px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    @media (max-width: 768px) {
      .calendar-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .calendar-cell {
        min-height: 60px;
        padding: 8px;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AvailabilityCalendarComponent implements OnInit {
  selectedProperty = '';
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  
  properties = [
    { id: '1', name: 'Bureau moderne - Paris' },
    { id: '2', name: 'Salle de réunion - Lyon' },
    { id: '3', name: 'Espace coworking - Marseille' }
  ];

  calendarWeeks: any[][] = [];
  availabilitySummary = {
    available: 0,
    unavailable: 0,
    booked: 0
  };

  ngOnInit() {
    this.generateCalendar();
  }

  onPropertyChange() {
    if (this.selectedProperty) {
      this.generateCalendar();
      this.calculateSummary();
    }
  }

  previousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  get currentMonthName(): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[this.currentMonth];
  }

  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);

    this.calendarWeeks = [];
    let currentWeek: any[] = [];

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const day = {
        date: currentDate,
        dayNumber: currentDate.getDate(),
        otherMonth: currentDate.getMonth() !== this.currentMonth,
        isToday: this.isToday(currentDate),
        available: this.isAvailable(currentDate),
        unavailable: this.isUnavailable(currentDate),
        booked: this.isBooked(currentDate)
      };

      currentWeek.push(day);

      if (currentWeek.length === 7) {
        this.calendarWeeks.push(currentWeek);
        currentWeek = [];
      }
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isAvailable(date: Date): boolean {
    // Simulate availability logic
    return Math.random() > 0.7;
  }

  isUnavailable(date: Date): boolean {
    // Simulate unavailability logic
    return Math.random() > 0.8;
  }

  isBooked(date: Date): boolean {
    // Simulate booking logic
    return Math.random() > 0.9;
  }

  toggleAvailability(day: any) {
    if (day.otherMonth) return;

    if (day.available) {
      day.available = false;
      day.unavailable = true;
    } else if (day.unavailable) {
      day.unavailable = false;
      day.booked = true;
    } else if (day.booked) {
      day.booked = false;
      day.available = true;
    } else {
      day.available = true;
    }

    this.calculateSummary();
  }

  getStatusClass(day: any): string {
    if (day.available) return 'available';
    if (day.unavailable) return 'unavailable';
    if (day.booked) return 'booked';
    return '';
  }

  getDayTooltip(day: any): string {
    if (day.otherMonth) return '';
    if (day.available) return 'Disponible - Cliquez pour changer';
    if (day.unavailable) return 'Indisponible - Cliquez pour changer';
    if (day.booked) return 'Réservé - Cliquez pour changer';
    return 'Libre - Cliquez pour définir';
  }

  calculateSummary() {
    this.availabilitySummary = {
      available: 0,
      unavailable: 0,
      booked: 0
    };

    this.calendarWeeks.forEach(week => {
      week.forEach(day => {
        if (!day.otherMonth) {
          if (day.available) this.availabilitySummary.available++;
          if (day.unavailable) this.availabilitySummary.unavailable++;
          if (day.booked) this.availabilitySummary.booked++;
        }
      });
    });
  }

  addAvailability() {
    // Implement add availability logic
  }

  setAvailable() {
    // Implement set available logic
  }

  setUnavailable() {
    // Implement set unavailable logic
  }

  exportCalendar() {
    // Implement export logic
  }
} 