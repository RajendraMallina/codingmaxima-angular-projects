import { Component, afterNextRender, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface Currency {
  iso_code: string;
  name: string;
}
interface Conversion {
  amount: number;
  base: string;
  quote: string;
  rate: number;
  date: string;
}
@Component({
  selector: 'app-currency-converter',
  imports: [FormsModule],
  styleUrls: ['../practice-labs.css', './api-projects.css'],
  templateUrl: './currency-converter.html',
})
export class CurrencyConverter {
  protected readonly currencies = signal<Currency[]>([]);
  protected readonly result = signal<Conversion | null>(null);
  protected readonly status = signal('Loading currencies…');
  protected amount: number | null = 100;
  protected base = 'USD';
  protected quote = 'EUR';
  protected date = '';
  private request = 0;
  constructor() {
    afterNextRender(() => void this.loadCurrencies());
  }
  protected async loadCurrencies(): Promise<void> {
    this.status.set('Loading currencies…');
    try {
      const response = await fetch('https://api.frankfurter.dev/v2/currencies');
      if (!response.ok) throw Error();
      const data: unknown = await response.json();
      const list = Array.isArray(data)
        ? data.filter(
            (c): c is Currency =>
              !!c && typeof c.iso_code === 'string' && typeof c.name === 'string',
          )
        : [];
      if (!list.length) throw Error();
      this.currencies.set(list);
      this.status.set('Enter an amount and choose currencies.');
    } catch {
      this.status.set('Could not load currencies. Check your connection and retry.');
    }
  }
  protected swap(): void {
    [this.base, this.quote] = [this.quote, this.base];
    this.result.set(null);
  }
  protected async convert(): Promise<void> {
    const amount = this.amount,
      base = this.base,
      quote = this.quote,
      date = this.date;
    const id = ++this.request;
    this.result.set(null);
    if (amount === null || !Number.isFinite(amount) || amount < 0) {
      this.status.set('Enter a non-negative amount.');
      return;
    }
    if (base === quote) {
      this.result.set({ amount, base, quote, rate: 1, date: '' });
      this.status.set('Both currencies are the same.');
      return;
    }
    this.status.set('Loading exchange rate…');
    try {
      const params = new URLSearchParams({ base, quotes: quote });
      if (date) params.set('date', date);
      const response = await fetch('https://api.frankfurter.dev/v2/rates?' + params);
      if (!response.ok) throw Error();
      const rows = (await response.json()) as { rate?: number; date?: string; quote?: string }[];
      if (id !== this.request) return;
      const row = Array.isArray(rows) ? rows.find((x) => x.quote === quote) : undefined;
      if (!row || typeof row.rate !== 'number' || !Number.isFinite(row.rate) || !row.date) {
        this.status.set('No rate is available for this currency pair and date.');
        return;
      }
      this.result.set({ amount, base, quote, rate: row.rate, date: row.date });
      this.status.set(date ? 'Historical rate' : 'Latest available rate');
    } catch {
      if (id === this.request)
        this.status.set('Could not load a rate. Try another date or try again later.');
    }
  }
  protected number(value: number): string {
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }
}
