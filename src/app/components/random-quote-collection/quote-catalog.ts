import { InjectionToken } from '@angular/core';
import { Quote, RandomSource } from './quote-sampler';

// Original local quotations; the catalog and each entry are immutable.
export const LOCAL_QUOTES: readonly Quote[] = Object.freeze([
  { id: 'small-step', text: 'A small step taken today gives tomorrow somewhere to begin.', author: 'Local collection' },
  { id: 'curiosity', text: 'Curiosity turns an ordinary moment into an open door.', author: 'Local collection' },
  { id: 'practice', text: 'Practice is patience made visible.', author: 'Local collection' },
  { id: 'listening', text: 'Listening carefully is a quiet way to make room for someone.', author: 'Local collection' },
  { id: 'progress', text: 'Progress can be gentle and still be progress.', author: 'Local collection' },
  { id: 'questions', text: 'A useful question can carry you further than a quick answer.', author: 'Local collection' },
  { id: 'rest', text: 'Rest gives effort a chance to find its direction again.', author: 'Local collection' },
  { id: 'kindness', text: 'Kindness leaves a path that others can follow.', author: 'Local collection' },
  { id: 'learning', text: 'Learning begins where certainty makes room for discovery.', author: 'Local collection' },
  { id: 'attention', text: 'What you give your attention to becomes part of your day.', author: 'Local collection' },
  { id: 'change', text: 'Change often arrives as a choice small enough to make today.', author: 'Local collection' },
  { id: 'creation', text: 'Make something imperfect, then give it another thoughtful turn.', author: 'Local collection' },
].map((quote) => Object.freeze(quote)));

export type QuoteCatalogLoader = () => Promise<readonly Quote[]>;

// Replace this provider with an HTTP-backed loader when the catalog moves online.
export const QUOTE_CATALOG_LOADER = new InjectionToken<QuoteCatalogLoader>('Quote catalog loader', {
  providedIn: 'root',
  factory: () => async () => LOCAL_QUOTES,
});

export const QUOTE_RANDOM_SOURCE = new InjectionToken<RandomSource>('Quote random source', {
  providedIn: 'root',
  factory: () => Math.random,
});
