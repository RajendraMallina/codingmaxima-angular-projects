export interface Quote {
  readonly id: string;
  readonly text: string;
  readonly author: string;
}

export type RandomSource = () => number;

export function validateCatalog(catalog: readonly Quote[]): void {
  if (!Array.isArray(catalog)) {
    throw new Error('The quote catalog must be a list.');
  }
  const ids = new Set<string>();
  for (const quote of catalog) {
    if (!quote || typeof quote.id !== 'string' || !quote.id.trim() ||
        typeof quote.text !== 'string' || !quote.text.trim() ||
        typeof quote.author !== 'string' || !quote.author.trim()) {
      throw new Error('Every quote needs an ID, text, and author.');
    }
    if (ids.has(quote.id)) {
      throw new Error('The catalog contains duplicate quote IDs.');
    }
    ids.add(quote.id);
  }
}

/** Empty catalogs return []; oversized requests return the entire catalog.
 * Invalid counts, catalogs, or random values throw before returning a set.
 * A repeated membership set is repaired without retries when another set exists.
 */
export function sampleQuotes(
  catalog: readonly Quote[],
  requestedCount: number,
  previousIds: readonly string[] = [],
  random: RandomSource = Math.random,
): Quote[] {
  validateCatalog(catalog);
  if (!Number.isSafeInteger(requestedCount) || requestedCount < 1) {
    throw new Error('Enter a positive whole number of quotes.');
  }
  const count = Math.min(requestedCount, catalog.length);
  if (count === 0) return [];

  const shuffled = [...catalog];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new Error('The random source must return a number from 0 up to, but not including, 1.');
    }
    const j = Math.floor(value * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const previous = new Set(previousIds);
  const repeats = previous.size === count &&
    shuffled.slice(0, count).every((quote) => previous.has(quote.id));
  if (repeats && count < shuffled.length) {
    // The next quote is outside the selected set, guaranteeing changed membership.
    [shuffled[count - 1], shuffled[count]] = [shuffled[count], shuffled[count - 1]];
  }
  return shuffled.slice(0, count);
}
