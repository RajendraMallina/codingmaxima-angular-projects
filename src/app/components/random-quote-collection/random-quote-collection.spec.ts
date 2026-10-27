import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCAL_QUOTES, QUOTE_CATALOG_LOADER, QUOTE_RANDOM_SOURCE, QuoteCatalogLoader } from './quote-catalog';
import { Quote } from './quote-sampler';
import { RandomQuoteCollection } from './random-quote-collection';

describe('RandomQuoteCollection', () => {
  let fixture: ComponentFixture<RandomQuoteCollection>;

  async function create(loader: QuoteCatalogLoader = async () => LOCAL_QUOTES) {
    await TestBed.configureTestingModule({
      imports: [RandomQuoteCollection],
      providers: [
        { provide: QUOTE_CATALOG_LOADER, useValue: loader },
        { provide: QUOTE_RANDOM_SOURCE, useValue: () => 0.999 },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RandomQuoteCollection);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function root(): HTMLElement { return fixture.nativeElement; }
  function ids(): string[] {
    return Array.from(root().querySelectorAll('figure')).map((card) => card.getAttribute('data-quote-id')!).sort();
  }
  async function generate(count: string) {
    const input = root().querySelector('input')!;
    input.value = count;
    input.dispatchEvent(new Event('input'));
    root().querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('renders semantic quote cards and regenerates without moving focus', async () => {
    await create();
    expect(ids()).toHaveLength(5);
    expect(root().querySelectorAll('blockquote')).toHaveLength(5);
    expect(root().querySelectorAll('figcaption cite')).toHaveLength(5);
    document.body.appendChild(root());
    const button = root().querySelector('button')!;
    button.focus();
    for (let i = 0; i < 20; i++) {
      const previous = ids();
      button.click();
      await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
      expect(ids()).not.toEqual(previous);
      expect(ids()).toHaveLength(5);
      expect(document.activeElement).toBe(button);
    }
    expect(root().querySelector('[role="status"]')?.textContent).toContain('Set 21');
    root().remove();
  });

  it('renders quote and author markup as literal text', async () => {
    const text = '<img src=x onerror="alert(1)"><script>alert(1)</script>';
    const author = '<b>Unsafe author</b>';
    await create(async () => [{ id: 'unsafe', text, author }]);
    expect(root().querySelector('blockquote')?.textContent).toContain(text);
    expect(root().querySelector('cite')?.textContent).toBe(author);
    expect(root().querySelector('img, script, b')).toBeNull();
  });

  it('validates counts and caps oversized requests', async () => {
    await create();
    const previous = ids();
    for (const count of ['', '0', '-1', '1.5']) {
      await generate(count);
      expect(ids()).toEqual(previous);
      expect(root().querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
      expect(root().querySelector('#count-error')?.textContent).toContain('positive whole number');
    }
    await generate('999');
    expect(ids()).toHaveLength(LOCAL_QUOTES.length);
    expect(root().querySelector('#count-error')?.textContent).toBe('');
  });

  it('supports loading followed by an empty catalog', async () => {
    let resolve!: (catalog: readonly Quote[]) => void;
    await create(() => new Promise((done) => { resolve = done; }));
    expect(root().textContent).toContain('Loading the quote catalog');
    expect(root().querySelector('button')?.disabled).toBe(true);
    resolve([]);
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root().textContent).toContain('No quotes yet');
    expect(ids()).toHaveLength(0);
  });

  it('supports load errors and retry', async () => {
    let attempts = 0;
    await create(async () => {
      if (++attempts === 1) throw new Error('Offline');
      return LOCAL_QUOTES;
    });
    expect(root().textContent).toContain('Quotes unavailable');
    const retry = Array.from(root().querySelectorAll('button')).find((button) => button.textContent?.includes('Retry'))!;
    retry.click();
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(ids()).toHaveLength(5);
    expect(root().textContent).not.toContain('Quotes unavailable');
  });

  it('treats malformed catalogs as errors', async () => {
    await create(async () => [LOCAL_QUOTES[0], LOCAL_QUOTES[0]]);
    expect(root().textContent).toContain('Quotes unavailable');
    expect(ids()).toHaveLength(0);
  });

  it('ignores stale loads and completion after destruction', async () => {
    const pending: Array<(catalog: readonly Quote[]) => void> = [];
    await create(() => new Promise((done) => pending.push(done)));
    const reload = fixture.componentInstance.reloadCatalog();
    pending[1]([]);
    await reload;
    pending[0](LOCAL_QUOTES);
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root().textContent).toContain('No quotes yet');
    const finalLoad = fixture.componentInstance.reloadCatalog();
    fixture.destroy();
    pending[2](LOCAL_QUOTES);
    await expect(finalLoad).resolves.toBeUndefined();
  });
});


