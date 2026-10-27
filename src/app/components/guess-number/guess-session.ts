import { Injectable, InjectionToken, signal } from '@angular/core';
import { GuessRandomSource } from './guess-game';

export const GUESS_RANDOM_SOURCE = new InjectionToken<GuessRandomSource>('Guess random source', {
  providedIn: 'root', factory: () => Math.random,
});

// Root lifetime preserves the session best even when navigating away from the game.
@Injectable({ providedIn: 'root' })
export class GuessSession {
  readonly highScore = signal(0);
}
