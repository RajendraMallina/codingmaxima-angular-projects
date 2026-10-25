import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  imports: [DecimalPipe],
  selector: 'app-centimeter-feets',
  styleUrl: './centimeter-feets.css',
  templateUrl: './centimeter-feets.html',
})
export class CentimeterFeets {
  protected readonly centimeters = signal<number | null>(null);
  protected readonly feet = signal<number | null>(null);
  private readonly centimetersPerFoot = 30.48;

  protected convert(event: Event, unit: 'centimeters' | 'feet'): void {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    const amount = input.validity.valid && Number.isFinite(value) && value >= 0 ? value : null;

    if (unit === 'centimeters') {
      this.centimeters.set(amount);
      this.feet.set(amount === null ? null : amount / this.centimetersPerFoot);
    } else {
      this.feet.set(amount);
      this.centimeters.set(amount === null ? null : amount * this.centimetersPerFoot);
    }
  }
}
