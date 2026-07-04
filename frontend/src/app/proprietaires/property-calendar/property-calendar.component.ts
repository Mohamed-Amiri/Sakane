import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProprietairesService, Property, CalendarEvent } from '../services/proprietaires.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { MadCurrencyPipe } from '../../shared/pipes/mad-currency.pipe';

interface PricingRule {
  id?: number;
  startDate: Date;
  endDate: Date;
  price: number;
  title?: string;
  isWeekend?: boolean;
  isSpecialEvent?: boolean;
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
  price?: number;
  isBlocked: boolean;
  isBooked: boolean;
  isPending?: boolean;
  isAvailable: boolean;
  status: 'available' | 'booked' | 'blocked' | 'disabled' | 'pending';
}

@Component({
  selector: 'app-property-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MadCurrencyPipe
  ],
  templateUrl: './property-calendar.component.html',
  styleUrls: ['./property-calendar.component.scss']
})
export class PropertyCalendarComponent implements OnInit {
  property: Property | null = null;
  propertyId: number = 0;
  calendarEvents: CalendarEvent[] = [];
  currentMonth: Date = new Date();
  currentTime: Date = new Date();
  loading = false;
  
  calendarDays: CalendarDay[] = [];
  selectedDates: Date[] = [];
  selectionMode: 'single' | 'range' | 'multiple' = 'range';
  viewMode: 'month' | 'week' = 'month';
  
  pricingRules: PricingRule[] = [];
  defaultPrice: number = 0;
  pricingForm: FormGroup;
  showPricingPanel: boolean = false;
  
  selectedTab: number = 0;
  
  monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  dayHeaders = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  basePrice: number = 0;
  weekendMultiplier: number = 120;
  selectedSeason: string = 'summer';
  seasonalMultiplier: number = 150;
  showBulkPricing: boolean = false;
  bulkPrice: number = 0;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private formBuilder: FormBuilder,
    private proprietairesService: ProprietairesService,
    private toastService: ToastService
  ) {
    this.currentMonth = new Date();
    this.loading = false;
    
    this.pricingForm = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      title: [''],
      isWeekend: [false],
      isSpecialEvent: [false]
    });
  }

  ngOnInit(): void {
    this.currentMonth = new Date();
    
    this.route.params.subscribe(params => {
      this.propertyId = +params['id'];
      
      if (!this.propertyId || isNaN(this.propertyId)) {
        this.toastService.error('ID de propriété invalide');
        this.initializeEmptyCalendar();
        this.loading = false;
        return;
      }
      
      this.loading = true;
      this.loadProperty();
      this.loadCalendarData();
      this.loadPricingRules();
      
      setTimeout(() => {
        this.forceRefreshCalendar();
      }, 100);
    });
  }

  forceRefreshCalendar(): void {
    this.generateCalendar();
  }

  private initializeEmptyCalendar(): void {
    this.calendarEvents = [];
    this.generateCalendar();
  }

  private loadProperty(): void {
    this.proprietairesService.getPropertyById(this.propertyId).subscribe({
      next: (property) => {
        this.property = property;
        this.defaultPrice = property.price || 0;
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.defaultPrice = 100;
      }
    });
  }

  private loadPricingRules(): void {
    this.pricingRules = [];
  }

  private loadCalendarData(): void {
    const startDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const endDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    
    this.proprietairesService.getPropertyCalendar(this.propertyId, startDate, endDate).subscribe({
      next: (events) => {
        this.calendarEvents = events || [];
        this.generateCalendar();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading calendar:', error);
        this.calendarEvents = [];
        this.generateCalendar();
        this.loading = false;
      }
    });
  }

  private generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    this.calendarDays = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const events = this.getEventsForDate(currentDate);
      const isBlocked = events.some(e => e.type === 'blocked');
      const isBooked = events.some(e => e.type === 'booked');
      const isPending = events.some(e => e.type === 'pending');
      const isAvailable = !isBlocked && !isBooked && !isPending;
      
      const dayData: CalendarDay = {
        date: new Date(currentDate),
        day: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isToday(currentDate),
        isSelected: this.isDateSelected(currentDate),
        events: events,
        price: this.getPriceForDate(currentDate),
        isBlocked: isBlocked,
        isBooked: isBooked,
        isPending: isPending,
        isAvailable: isAvailable,
        status: isBooked ? 'booked' : isPending ? 'pending' : isBlocked ? 'blocked' : isAvailable ? 'available' : 'disabled'
      };
      
      this.calendarDays.push(dayData);
      currentDate.setDate(currentDate.getDate() + 1);
      
      if (currentDate.getMonth() !== month && i >= 35) {
        break;
      }
    }
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  private getEventsForDate(date: Date): CalendarEvent[] {
    return this.calendarEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return date >= eventStart && date <= eventEnd;
    });
  }

  private isDateSelected(date: Date): boolean {
    return this.selectedDates.some(selectedDate => 
      selectedDate.toDateString() === date.toDateString()
    );
  }

  private getPriceForDate(date: Date): number {
    const rule = this.pricingRules.find(rule => 
      date >= rule.startDate && date <= rule.endDate
    );
    
    if (rule) {
      return rule.price;
    }
    
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (isWeekend && this.property) {
      return this.defaultPrice * 1.2;
    }
    
    return this.defaultPrice;
  }

  onDateClick(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    
    const clickedDate = new Date(day.date);
    
    if (this.selectionMode === 'single') {
      this.selectedDates = [clickedDate];
    } else if (this.selectionMode === 'multiple') {
      const index = this.selectedDates.findIndex(date => 
        date.toDateString() === clickedDate.toDateString()
      );
      
      if (index >= 0) {
        this.selectedDates.splice(index, 1);
      } else {
        this.selectedDates.push(clickedDate);
      }
    } else if (this.selectionMode === 'range') {
      if (this.selectedDates.length === 0) {
        this.selectedDates = [clickedDate];
      } else if (this.selectedDates.length === 1) {
        const startDate = this.selectedDates[0];
        if (clickedDate > startDate) {
          this.selectedDates = this.getDateRange(startDate, clickedDate);
        } else {
          this.selectedDates = [clickedDate];
        }
      } else {
        this.selectedDates = [clickedDate];
      }
    }
    
    this.generateCalendar();
  }

  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  addPricingRule(): void {
    if (this.pricingForm.valid && this.selectedDates.length >= 2) {
      const formValue = this.pricingForm.value;
      const startDate = this.selectedDates[0];
      const endDate = this.selectedDates[this.selectedDates.length - 1];
      
      const newRule: PricingRule = {
        startDate,
        endDate,
        price: formValue.price,
        title: formValue.title || `Prix personnalisé`,
        isWeekend: formValue.isWeekend,
        isSpecialEvent: formValue.isSpecialEvent
      };
      
      this.pricingRules.push(newRule);
      this.savePricingRule(newRule);
      this.pricingForm.reset();
      this.selectedDates = [];
      this.generateCalendar();
      
      this.toastService.success('Règle de tarification ajoutée');
    } else {
      this.toastService.warning('Veuillez sélectionner des dates et remplir le formulaire');
    }
  }

  private savePricingRule(rule: PricingRule): void {
  }

  deletePricingRule(rule: PricingRule): void {
    const index = this.pricingRules.findIndex(r => r.id === rule.id);
    if (index >= 0) {
      this.pricingRules.splice(index, 1);
      this.generateCalendar();
      this.toastService.success('Règle de tarification supprimée');
    }
  }

  clearSelection(): void {
    this.selectedDates = [];
    this.generateCalendar();
  }

  blockSelectedDates(): void {
    if (this.selectedDates.length === 0) {
      this.toastService.warning('Veuillez sélectionner des dates');
      return;
    }
    
    const startDate = this.selectedDates[0];
    const endDate = this.selectedDates[this.selectedDates.length - 1];
    const title = prompt('Titre pour le blocage (optionnel):') || 'Dates bloquées';
    
    this.proprietairesService.blockDates(this.propertyId, startDate, endDate, title).subscribe({
      next: (event) => {
        this.toastService.success('Dates bloquées avec succès');
        this.selectedDates = [];
        this.loadCalendarData();
      },
      error: (error) => {
        console.error('Error blocking dates:', error);
        this.toastService.error('Erreur lors du blocage des dates');
      }
    });
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.loadCalendarData();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.loadCalendarData();
  }

  goToToday(): void {
    this.currentMonth = new Date();
    this.loadCalendarData();
  }

  setViewMode(mode: 'month' | 'week'): void {
    this.viewMode = mode;
    this.generateCalendar();
  }

  setSelectionMode(mode: 'single' | 'range' | 'multiple'): void {
    this.selectionMode = mode;
    this.selectedDates = [];
    this.generateCalendar();
  }

  getSelectedDateRange(): string {
    if (this.selectedDates.length === 0) return '';
    if (this.selectedDates.length === 1) {
      return this.selectedDates[0].toLocaleDateString('fr-FR');
    }
    
    const startDate = this.selectedDates[0];
    const endDate = this.selectedDates[this.selectedDates.length - 1];
    return `${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`;
  }

  getTotalPriceForSelection(): number {
    return this.selectedDates.reduce((total, date) => {
      return total + this.getPriceForDate(date);
    }, 0);
  }

  unblockEvent(event: CalendarEvent): void {
    if (event.type === 'blocked' && event.id) {
      this.proprietairesService.unblockDates(event.id).subscribe({
        next: () => {
          this.toastService.success('Dates débloquées avec succès');
          this.loadCalendarData();
        },
        error: (error) => {
          console.error('Error unblocking dates:', error);
          this.toastService.error('Erreur lors du déblocage des dates');
        }
      });
    }
  }

  getEventTypeClass(type: string): string {
    switch (type) {
      case 'booked': return 'booked';
      case 'blocked': return 'blocked';
      case 'available': return 'available';
      default: return '';
    }
  }

  getEventTypeLabel(type: string): string {
    switch (type) {
      case 'booked': return 'Réservé';
      case 'blocked': return 'Bloqué';
      case 'available': return 'Disponible';
      default: return type;
    }
  }

  getAvailableEventsCount(): number {
    return this.calendarEvents ? this.calendarEvents.filter(e => e.type === 'available').length : 0;
  }

  getBookedEventsCount(): number {
    return this.calendarEvents ? this.calendarEvents.filter(e => e.type === 'booked').length : 0;
  }

  getBlockedEventsCount(): number {
    return this.calendarEvents ? this.calendarEvents.filter(e => e.type === 'blocked').length : 0;
  }

  blockDates(): void {
    this.showPricingPanel = true;
    this.selectedTab = 1;
  }

  getRecentEvents(): CalendarEvent[] {
    if (!this.calendarEvents) return [];
    
    return this.calendarEvents
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  }

  getCalendarDaysAsWeeks(): CalendarDay[][] {
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < this.calendarDays.length; i += 7) {
      weeks.push(this.calendarDays.slice(i, i + 7));
    }
    return weeks;
  }

  getMonthlyRevenue(): number {
    const currentMonth = this.currentMonth.getMonth();
    const currentYear = this.currentMonth.getFullYear();
    
    return this.calendarDays
      .filter(day => 
        day.isCurrentMonth && 
        day.isBooked &&
        day.date.getMonth() === currentMonth &&
        day.date.getFullYear() === currentYear
      )
      .reduce((total, day) => total + (day.price || 0), 0);
  }

  getOccupancyRate(): number {
    const currentMonthDays = this.calendarDays.filter(day => day.isCurrentMonth);
    const bookedDays = currentMonthDays.filter(day => day.isBooked);
    
    return currentMonthDays.length > 0 ? (bookedDays.length / currentMonthDays.length) * 100 : 0;
  }

  getAvailableDaysCount(): number {
    return this.calendarDays.filter(day => day.isAvailable && day.isCurrentMonth).length;
  }

  getBookedDaysCount(): number {
    return this.calendarDays.filter(day => day.isBooked && day.isCurrentMonth).length;
  }

  getBlockedDaysCount(): number {
    return this.calendarDays.filter(day => day.isBlocked && day.isCurrentMonth).length;
  }

  getPendingDaysCount(): number {
    return this.calendarDays.filter(day => day.status === 'pending' && day.isCurrentMonth).length;
  }

  getAveragePrice(): number {
    const daysWithPrice = this.calendarDays.filter(day => day.price && day.isCurrentMonth);
    if (daysWithPrice.length === 0) return 0;
    
    const total = daysWithPrice.reduce((sum, day) => sum + (day.price || 0), 0);
    return Math.round(total / daysWithPrice.length);
  }

  getCurrentMonthYear(): string {
    return `${this.monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }

  onDateRangeChange(): void {
    if (this.selectedStartDate && this.selectedEndDate) {
      this.selectedDates = this.getDateRange(this.selectedStartDate, this.selectedEndDate);
      this.updateCalendarSelection();
    }
  }

  hasSelectedDates(): boolean {
    return this.selectedDates.length > 0;
  }

  getSelectedDatesCount(): number {
    return this.selectedDates.length;
  }

  getTotalSelectedPrice(): number {
    return this.selectedDates.reduce((total, date) => {
      const day = this.calendarDays.find(d => this.isSameDate(d.date, date));
      return total + (day?.price || 0);
    }, 0);
  }

  getTotalBulkPrice(): number {
    return this.getSelectedDatesCount() * this.bulkPrice;
  }

  getDayClasses(day: CalendarDay): string {
    const classes = ['calendar-day'];
    
    if (!day.isCurrentMonth) classes.push('disabled');
    if (day.isSelected) classes.push('selected');
    if (day.isAvailable) classes.push('available');
    if (day.isBooked) classes.push('booked');
    if (day.isBlocked) classes.push('blocked');
    if (day.isToday) classes.push('today');
    
    return classes.join(' ');
  }

  toggleDaySelection(day: CalendarDay): void {
    if (!day.isCurrentMonth || day.isBooked) return;

    const dateIndex = this.selectedDates.findIndex(date => this.isSameDate(date, day.date));
    
    if (dateIndex >= 0) {
      this.selectedDates.splice(dateIndex, 1);
      day.isSelected = false;
    } else {
      this.selectedDates.push(day.date);
      day.isSelected = true;
    }

    if (this.selectedDates.length > 0) {
      this.selectedDates.sort((a, b) => a.getTime() - b.getTime());
      this.selectedStartDate = this.selectedDates[0];
      this.selectedEndDate = this.selectedDates[this.selectedDates.length - 1];
    } else {
      this.selectedStartDate = null;
      this.selectedEndDate = null;
    }
  }

  setAvailable(): void {
    this.selectedDates.forEach(date => {
      const day = this.calendarDays.find(d => this.isSameDate(d.date, date));
      if (day) {
        day.isAvailable = true;
        day.isBlocked = false;
        day.status = 'available';
      }
    });
    this.toastService.success('Dates rendues disponibles');
  }

  setBlocked(): void {
    this.selectedDates.forEach(date => {
      const day = this.calendarDays.find(d => this.isSameDate(d.date, date));
      if (day) {
        day.isAvailable = false;
        day.isBlocked = true;
        day.status = 'blocked';
      }
    });
    this.toastService.success('Dates bloquées');
  }

  updateBasePrice(): void {
    if (this.property) {
      this.property.price = this.basePrice;
      this.calendarDays.forEach(day => {
        if (day.isAvailable) {
          day.price = this.basePrice;
        }
      });
      this.toastService.success('Prix de base mis à jour');
    }
  }

  updateWeekendPricing(): void {
    this.calendarDays.forEach(day => {
      if (day.isAvailable && (day.date.getDay() === 0 || day.date.getDay() === 6)) {
        day.price = Math.round(this.basePrice * (this.weekendMultiplier / 100));
      }
    });
    this.toastService.success('Tarifs week-end appliqués');
  }

  updateSeasonalPricing(): void {
    const seasonMonths = this.getSeasonMonths(this.selectedSeason);
    
    this.calendarDays.forEach(day => {
      if (day.isAvailable && seasonMonths.includes(day.date.getMonth())) {
        day.price = Math.round(this.basePrice * (this.seasonalMultiplier / 100));
      }
    });
    this.toastService.success(`Tarifs ${this.selectedSeason} appliqués`);
  }

  applyBulkPricing(): void {
    this.selectedDates.forEach(date => {
      const day = this.calendarDays.find(d => this.isSameDate(d.date, date));
      if (day && day.isAvailable) {
        day.price = this.bulkPrice;
      }
    });
    
    this.showBulkPricing = false;
    this.selectedDates = [];
    this.updateCalendarSelection();
    this.toastService.success('Prix mis à jour pour les dates sélectionnées');
  }

  private getSeasonMonths(season: string): number[] {
    const seasons = {
      'spring': [2, 3, 4],
      'summer': [5, 6, 7],
      'autumn': [8, 9, 10],
      'winter': [11, 0, 1]
    };
    return seasons[season as keyof typeof seasons] || [];
  }

  private updateCalendarSelection(): void {
    this.calendarDays.forEach(day => {
      day.isSelected = this.selectedDates.some(date => this.isSameDate(date, day.date));
    });
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}