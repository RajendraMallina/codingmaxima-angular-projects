import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { QUOTE_CATALOG_LOADER, QUOTE_RANDOM_SOURCE } from './quote-catalog';
import { Quote, sampleQuotes, validateCatalog } from './quote-sampler';

type CatalogState = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  selector: 'app-random-quote-collection',
  templateUrl: './random-quote-collection.html',
  styleUrl: './random-quote-collection.css',
})
export class RandomQuoteCollection {
  protected readonly state = signal<CatalogState>('loading');
  protected readonly catalog = signal<readonly Quote[]>([]);
  protected readonly quotes = signal<readonly Quote[]>([]);
  protected readonly requestedCount = signal(5);
  protected readonly showAuthors = signal(false);
  protected readonly validationError = signal('');
  protected readonly catalogError = signal('');
  protected readonly announcement = signal('');
  protected readonly generation = signal(0);
  private readonly loader = inject(QUOTE_CATALOG_LOADER);
  private readonly random = inject(QUOTE_RANDOM_SOURCE);
  private readonly destroyRef = inject(DestroyRef);
  private loadVersion = 0;

  constructor() {
    // Start after browser rendering so SSR and hydration share the loading view.
    afterNextRender(() => void this.reloadCatalog());
  }

  protected updateCount(event: Event): void {
    this.requestedCount.set((event.target as HTMLInputElement).valueAsNumber);
    this.validationError.set('');
  }

  async reloadCatalog(): Promise<void> {
    const version = ++this.loadVersion;
    this.state.set('loading');
    this.catalogError.set('');
    this.validationError.set('');
    this.quotes.set([]);
    this.announcement.set('Loading quotes.');
    try {
      const catalog = await this.loader();
      if (this.destroyRef.destroyed || version !== this.loadVersion) return;
      validateCatalog(catalog);
      this.catalog.set([...catalog]);
      this.state.set(catalog.length ? 'ready' : 'empty');
      if (catalog.length) this.generate();
      else this.announcement.set('The quote catalog is empty.');
    } catch {
      if (this.destroyRef.destroyed || version !== this.loadVersion) return;
      this.catalog.set([]);
      this.state.set('error');
      this.catalogError.set('Unable to load a valid quote catalog. Please try again.');
      this.announcement.set('Quotes could not be loaded.');
    }
  }

  protected generate(): void {
    if (this.state() !== 'ready') return;
    try {
      const quotes = sampleQuotes(
        this.catalog(), this.requestedCount(), this.quotes().map((quote) => quote.id), this.random,
      );
      this.quotes.set(quotes);
      this.validationError.set('');
      this.generation.update((value) => value + 1);
      this.announcement.set(`Set ${this.generation()}: ${quotes.length} distinct quotes selected.`);
    } catch (error) {
      this.validationError.set(error instanceof Error ? error.message : 'Unable to select quotes.');
    }
  }
}

