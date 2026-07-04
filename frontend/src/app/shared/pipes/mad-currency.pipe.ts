import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'madCurrency',
  standalone: true
})
export class MadCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, showEuro: boolean = false): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) {
      return '';
    }

    // Exchange rate: 1 EUR = 10.5 MAD
    const madValue = numericValue * 10.5;

    // Space as thousands separator, round to integer
    const formattedMad = Math.round(madValue)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    if (showEuro) {
      const formattedEur = Math.round(numericValue)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return `${formattedMad} DH (~${formattedEur}€)`;
    }

    return `${formattedMad} DH`;
  }
}
