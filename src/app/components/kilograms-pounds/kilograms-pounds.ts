import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  imports: [DecimalPipe],
  selector: 'app-kilograms-pounds',
  styleUrl: './kilograms-pounds.css',
  templateUrl: './kilograms-pounds.html',
})
export class KilogramsPounds {
  protected readonly kilograms = signal<number | null>(null);
  protected readonly pounds = signal<number | null>(null);
  private readonly poundsPerKilogram = 2.2046226218487757;

  protected convert(event: Event, unit: 'kilograms' | 'pounds'): void {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    const amount = input.validity.valid && Number.isFinite(value) && value >= 0 ? value : null;

    if (unit === 'kilograms') {
      this.kilograms.set(amount);
      this.pounds.set(amount === null ? null : amount * this.poundsPerKilogram);
    } else {
      this.pounds.set(amount);
      this.kilograms.set(amount === null ? null : amount / this.poundsPerKilogram);
    }
  }
}
