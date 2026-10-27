import { afterNextRender, Component, DestroyRef, inject, Injector, signal } from '@angular/core';
import { GuessRound, startRound, submitGuess } from './guess-game';
import { GUESS_RANDOM_SOURCE, GuessSession } from './guess-session';

@Component({
  selector: 'app-guess-number',
  templateUrl: './guess-number.html',
  styleUrl: './guess-number.css',
})
export class GuessNumber {
  protected readonly round = signal<GuessRound | null>(null);
  protected readonly error = signal('');
  protected readonly session = inject(GuessSession);
  private readonly random = inject(GUESS_RANDOM_SOURCE);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Draw only in the browser, avoiding different secret values during hydration.
    afterNextRender(() => this.beginRound());
  }

  private beginRound(): void {
    this.round.set(startRound(this.random, this.session.highScore()));
    this.error.set('');
  }

  protected check(input: HTMLInputElement, restart: HTMLButtonElement): void {
    const current = this.round();
    if (!current || current.status !== 'playing') return;
    const result = submitGuess(current, input.value);
    this.error.set(result.error);
    this.round.set(result.round);
    if (result.round.status === 'won') this.session.highScore.set(result.round.highScore);
    if (result.round.status === 'playing') {
      input.focus();
      input.select();
    } else {
      restart.focus();
    }
  }

  protected restart(input: HTMLInputElement): void {
    this.beginRound();
    input.value = '';
    afterNextRender(() => {
      if (!this.destroyRef.destroyed) input.focus();
    }, { injector: this.injector });
  }
}
