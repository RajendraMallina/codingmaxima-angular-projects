import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  imports: [DecimalPipe],
  selector: 'app-centimeter-feets-inches',
  styleUrl: './centimeter-feets-inches.css',
  templateUrl: './centimeter-feets-inches.html',
})
export class CentimeterFeetsInches {
  protected readonly centimeters = signal<number | null>(null);
  protected readonly feet = signal<number | null>(null);
  protected readonly inches = signal<number | null>(null);
  protected readonly invalid = signal(false);

  protected convertCentimeters(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    const valid = input.validity.valid && Number.isFinite(value) && value >= 0;
    this.invalid.set(input.value !== '' && !valid);
    this.centimeters.set(valid ? value : null);
    if (!valid) {
      this.feet.set(null);
      this.inches.set(null);
      return;
    }

    // Round before splitting so a value near a whole foot never shows 12 remaining inches.
    const totalInches = Math.round((value / 2.54) * 1e6) / 1e6;
    const wholeFeet = Math.floor(totalInches / 12);
    this.feet.set(wholeFeet);
    this.inches.set(Math.round((totalInches - wholeFeet * 12) * 1e6) / 1e6);
  }

  protected convertFeetAndInches(feetInput: HTMLInputElement, inchesInput: HTMLInputElement): void {
    const valid = (input: HTMLInputElement) =>
      input.value === '' || (input.validity.valid && Number.isFinite(input.valueAsNumber));
    const isValid = valid(feetInput) && valid(inchesInput);
    this.invalid.set(!isValid);
    this.feet.set(feetInput.value === '' ? null : feetInput.valueAsNumber);
    this.inches.set(inchesInput.value === '' ? null : inchesInput.valueAsNumber);
    if (!isValid || (feetInput.value === '' && inchesInput.value === '')) {
      this.centimeters.set(null);
      return;
    }
    const feet = feetInput.value === '' ? 0 : feetInput.valueAsNumber;
    const inches = inchesInput.value === '' ? 0 : inchesInput.valueAsNumber;
    this.centimeters.set((feet * 12 + inches) * 2.54);
  }
}

