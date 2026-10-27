export const MIN_GUESS = 1;
export const MAX_GUESS = 20;
export const STARTING_SCORE = 20;
export type GuessRandomSource = () => number;
export type RoundStatus = 'playing' | 'won' | 'lost';

export interface GuessRound {
  readonly secret: number;
  readonly score: number;
  readonly highScore: number;
  readonly status: RoundStatus;
  readonly turns: number;
  readonly feedback: string;
}

export interface GuessResult {
  readonly round: GuessRound;
  readonly error: string;
}

/** Both endpoints are inclusive. The random source supplies a value in [0, 1). */
export function chooseSecret(random: GuessRandomSource, min = MIN_GUESS, max = MAX_GUESS): number {
  const size = max - min + 1;
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max || !Number.isSafeInteger(size)) {
    throw new Error('The game range must have valid inclusive integer endpoints.');
  }
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error('The random source must return a number in [0, 1).');
  }
  return min + Math.floor(value * size);
}

export function startRound(random: GuessRandomSource, highScore = 0): GuessRound {
  return {
    secret: chooseSecret(random), score: STARTING_SCORE, highScore,
    status: 'playing', turns: 0, feedback: 'A new round is ready. Enter a number from 1 to 20.',
  };
}

/** Pure, constant-time transition. Invalid or terminal actions return the original round. */
export function submitGuess(round: GuessRound, rawGuess: string): GuessResult {
  if (round.status !== 'playing') return { round, error: '' };
  if (rawGuess.length > 32) return { round, error: 'Enter a number using at most 32 characters.' };
  const text = rawGuess.trim();
  if (!text) return { round, error: 'Enter a guess before checking.' };
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(text) || !Number.isFinite(Number(text))) {
    return { round, error: 'Enter a number, such as 7.' };
  }
  const guess = Number(text);
  if (!Number.isInteger(guess)) return { round, error: 'Enter a whole number; fractions are not allowed.' };
  if (guess < MIN_GUESS || guess > MAX_GUESS) {
    return { round, error: 'Enter a number from 1 to 20, inclusive.' };
  }

  const turns = round.turns + 1;
  if (guess === round.secret) {
    return {
      round: {
        ...round, turns, status: 'won', highScore: Math.max(round.highScore, round.score),
        feedback: `You won! Your guess was correct. Final score: ${round.score}.`,
      },
      error: '',
    };
  }
  const score = round.score - 1;
  return {
    round: {
      ...round, score, turns, status: score === 0 ? 'lost' : 'playing',
      feedback: score === 0
        ? 'You lost. Your score reached zero. Start a new round to play again.'
        : guess < round.secret ? 'Too low. Try a higher number.' : 'Too high. Try a lower number.',
    },
    error: '',
  };
}

