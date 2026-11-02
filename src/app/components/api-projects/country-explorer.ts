import { Component, afterNextRender, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Country {
  name: string;
  alpha2Code?: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  flag?: string;
  flags?: { svg?: string; png?: string };
  languages?: { name?: string }[];
  currencies?: { name?: string; code?: string; symbol?: string }[];
  timezones?: string[];
}
interface RecentCountry {
  name: string;
  code: string;
}

@Component({
  selector: 'app-country-explorer',
  imports: [FormsModule],
  styleUrls: ['../practice-labs.css', './api-projects.css'],
  templateUrl: './country-explorer.html',
})
export class CountryExplorer {
  protected query = '';
  protected readonly results = signal<Country[]>([]);
  protected readonly selected = signal<Country | null>(null);
  protected readonly recent = signal<RecentCountry[]>([]);
  protected readonly status = signal('Search for a country to begin.');
  protected readonly loading = signal(false);
  private request = 0;
  constructor() {
    afterNextRender(() => {
      try {
        const value: unknown = JSON.parse(
          localStorage.getItem('codingmaxima.country-recent.v1') || '[]',
        );
        if (Array.isArray(value))
          this.recent.set(
            value
              .filter(
                (v): v is RecentCountry =>
                  !!v && typeof v.name === 'string' && typeof v.code === 'string',
              )
              .slice(0, 5),
          );
      } catch {
        /* Recent history is optional. */
      }
    });
  }
  protected async search(): Promise<void> {
    const query = this.query.trim();
    if (!query) {
      this.status.set('Enter a country name.');
      return;
    }
    await this.load('name/' + encodeURIComponent(query), false);
  }
  protected async openRecent(country: RecentCountry): Promise<void> {
    await this.load('alpha/' + encodeURIComponent(country.code), true);
  }
  private async load(path: string, detail: boolean): Promise<void> {
    const id = ++this.request;
    this.loading.set(true);
    this.status.set('Searching countries…');
    this.selected.set(null);
    this.results.set([]);
    try {
      const response = await fetch('https://countries.dev/' + path);
      if (response.status === 404) throw new Error('No country found. Try another name.');
      if (response.status === 429) throw new Error('Too many requests. Please try again later.');
      if (!response.ok)
        throw new Error('Country data is temporarily unavailable. Please try again.');
      const data: unknown = await response.json();
      if (id !== this.request) return;
      const rows = (Array.isArray(data) ? data : [data]).filter(
        (row): row is Country => !!row && typeof row.name === 'string',
      );
      if (!rows.length) {
        this.status.set('No country found. Try another name.');
        return;
      }
      this.results.set(rows);
      this.status.set(`${rows.length} ${rows.length === 1 ? 'country' : 'countries'} found.`);
      if (detail) this.show(rows[0]);
    } catch (error) {
      if (id === this.request)
        this.status.set(
          error instanceof Error
            ? error.message
            : 'Could not connect. Check your internet and try again.',
        );
    } finally {
      if (id === this.request) this.loading.set(false);
    }
  }
  protected show(country: Country): void {
    this.selected.set(country);
    if (!country.alpha2Code) return;
    const recent = [
      { name: country.name, code: country.alpha2Code },
      ...this.recent().filter((item) => item.code !== country.alpha2Code),
    ].slice(0, 5);
    this.recent.set(recent);
    try {
      localStorage.setItem('codingmaxima.country-recent.v1', JSON.stringify(recent));
    } catch {
      /* Browsing still works without storage. */
    }
  }
  protected flag(country: Country): string {
    const value = country.flags?.svg || country.flags?.png || country.flag || '';
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  }
  protected languages(country: Country): string {
    return (
      country.languages
        ?.map((item) => item.name)
        .filter(Boolean)
        .join(', ') || 'Not available'
    );
  }
  protected currencies(country: Country): string {
    return (
      country.currencies
        ?.map((item) => [item.name, item.code].filter(Boolean).join(' · '))
        .filter(Boolean)
        .join(', ') || 'Not available'
    );
  }
  protected population(country: Country): string {
    return typeof country.population === 'number'
      ? country.population.toLocaleString()
      : 'Not available';
  }
}
