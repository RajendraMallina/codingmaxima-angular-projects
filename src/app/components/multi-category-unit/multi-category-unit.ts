import { afterNextRender, Component, computed, DestroyRef, inject, Injector, signal } from '@angular/core';
import { CATEGORIES, getCategory, getUnit } from './unit-config';
import { ConverterState, convertTargets, defaultConverterState, parseValue, switchCategory, switchSource } from './unit-conversion';
import { formatMeasurement } from './unit-format';

@Component({
  selector: 'app-multi-category-unit',
  templateUrl: './multi-category-unit.html',
  styleUrl: './multi-category-unit.css',
})
export class MultiCategoryUnit {
  protected readonly categories = CATEGORIES;
  protected readonly state = signal<ConverterState>(defaultConverterState());
  protected readonly category = computed(() => getCategory(this.state().category));
  protected readonly source = computed(() => getUnit(this.state().category, this.state().source));
  protected readonly conversion = computed(() => {
    const state = this.state();
    const parsed = parseValue(state.rawValue);
    if (parsed.status !== 'valid') return { status: parsed.status, message: parsed.status === 'invalid' ? parsed.message : '', results: [] };
    try {
      return { status: 'valid', message: '', results: convertTargets(state.category, state.source, parsed.value) };
    } catch (error) {
      return { status: 'invalid', message: error instanceof Error ? error.message : 'Unable to convert this value.', results: [] };
    }
  });
  protected readonly announcement = signal('');
  protected readonly formatResult = formatMeasurement;
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected changeCategory(id: string, input: HTMLInputElement): void {
    if (id === this.state().category) return;
    this.state.set(switchCategory(this.state(), id));
    this.announcement.set(`${this.category().label} selected. Value cleared. Source unit: ${this.source().label}.`);
    this.focusInput(input);
  }

  protected changeSource(event: Event, input: HTMLInputElement): void {
    const id = (event.target as HTMLSelectElement).value;
    if (id === this.state().source) return;
    this.state.set(switchSource(this.state(), id));
    this.announcement.set(`Source unit: ${this.source().label}. Value cleared.`);
    this.focusInput(input);
  }

  protected updateValue(event: Event): void {
    this.state.update((state) => ({ ...state, rawValue: (event.target as HTMLInputElement).value }));
    this.announcement.set('');
  }

  protected reset(input: HTMLInputElement): void {
    this.state.set(defaultConverterState());
    this.announcement.set('Reset to Length and Centimeters. Value cleared.');
    this.focusInput(input);
  }

  private focusInput(input: HTMLInputElement): void {
    afterNextRender(() => {
      if (!this.destroyRef.destroyed) input.focus();
    }, { injector: this.injector });
  }
}

