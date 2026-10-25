import { Quote, sampleQuotes } from './quote-sampler';

const catalog: readonly Quote[] = Object.freeze(
  ['a', 'b', 'c', 'd', 'e'].map((id) => Object.freeze({ id, text: `Quote ${id}`, author: 'Collection' })),
);

describe('sampleQuotes', () => {
  it('returns the requested distinct IDs without changing the source', () => {
    const before = JSON.stringify(catalog);
    const selected = sampleQuotes(catalog, 3, [], () => 0.4);
    expect(selected).toHaveLength(3);
    expect(new Set(selected.map((quote) => quote.id)).size).toBe(3);
    expect(JSON.stringify(catalog)).toBe(before);
  });

  it('is reproducible with an injected random source', () => {
    expect(sampleQuotes(catalog, 3, [], () => 0))
      .toEqual(sampleQuotes(catalog, 3, [], () => 0));
  });

  it('avoids immediate repeated membership even with a constant random source', () => {
    let previous: string[] = [];
    for (let i = 0; i < 100; i++) {
      const selected = sampleQuotes(catalog, 3, previous, () => 0.999);
      const ids = selected.map((quote) => quote.id).sort();
      expect(ids).not.toEqual([...previous].sort());
      expect(new Set(ids).size).toBe(3);
      previous = ids;
    }
  });

  it('avoids repeats for requests of one and catalog size minus one', () => {
    for (const count of [1, 4]) {
      const first = sampleQuotes(catalog, count, [], () => 0);
      const next = sampleQuotes(catalog, count, first.map((quote) => quote.id), () => 0);
      expect(next.map((quote) => quote.id).sort()).not.toEqual(first.map((quote) => quote.id).sort());
    }
  });

  it('handles empty, singleton, exact-size, and oversized requests', () => {
    const unusedRandom = () => { throw new Error('Random should not be used'); };
    expect(sampleQuotes([], 3, [], unusedRandom)).toEqual([]);
    expect(sampleQuotes(catalog.slice(0, 1), 10, ['a'], unusedRandom)).toEqual([catalog[0]]);
    for (const count of [5, 99]) {
      expect(sampleQuotes(catalog, count, catalog.map((quote) => quote.id), () => 0))
        .toHaveLength(5);
    }
  });

  it('rejects invalid counts before calling randomness', () => {
    for (const count of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => sampleQuotes(catalog, count, [], () => { throw new Error('Unexpected RNG'); }))
        .toThrow('positive whole number');
    }
  });

  it('rejects duplicate IDs and malformed catalogs', () => {
    expect(() => sampleQuotes([catalog[0], catalog[0]], 2)).toThrow('duplicate');
    expect(() => sampleQuotes([{ id: '', text: 'Text', author: 'Author' }], 1)).toThrow('ID');
    expect(() => sampleQuotes(null as unknown as Quote[], 1)).toThrow('must be a list');
    expect(() => sampleQuotes([{ id: 'a', text: ' ', author: 'Author' }], 1)).toThrow('text');
  });

  it('rejects random values outside the documented range', () => {
    for (const value of [-0.1, 1, NaN, Infinity]) {
      expect(() => sampleQuotes(catalog, 2, [], () => value)).toThrow('random source');
    }
  });
});
