import { chooseSecret, GuessRound, startRound, submitGuess } from './guess-game';

describe('guess game random boundary', () => {
  it('reaches both inclusive endpoints', () => {
    expect(chooseSecret(() => 0)).toBe(1);
    expect(chooseSecret(() => 1 - Number.EPSILON / 2)).toBe(20);
  });

  it('covers every integer and never leaves the inclusive range', () => {
    const reached = new Set<number>();
    for (let i = 0; i < 20000; i++) {
      const secret = chooseSecret(() => i / 20000);
      expect(Number.isInteger(secret)).toBe(true);
      expect(secret).toBeGreaterThanOrEqual(1);
      expect(secret).toBeLessThanOrEqual(20);
      reached.add(secret);
    }
    expect(reached.size).toBe(20);
  });

  it('rejects bad random values and invalid range configuration', () => {
    for (const value of [-0.1, 1, NaN, Infinity]) {
      expect(() => chooseSecret(() => value)).toThrow('random source');
    }
    expect(() => chooseSecret(() => 0, 20, 1)).toThrow('range');
    expect(() => chooseSecret(() => 0, 1.5, 20)).toThrow('range');
  });
});

describe('guess game transitions', () => {
  const makeRound = (highScore = 0) => Object.freeze(startRound(() => 0.45, highScore)); // secret 10

  it('sets up a clean playing round with score 20', () => {
    expect(makeRound()).toMatchObject({ secret: 10, score: 20, turns: 0, status: 'playing', highScore: 0 });
  });

  it('rejects invalid guesses with specific messages and no state changes', () => {
    const round = makeRound();
    const cases = [
      ['', 'before checking'], ['   ', 'before checking'],
      ['1.5', 'whole number'], ['abc', 'Enter a number'],
      ['NaN', 'Enter a number'], ['Infinity', 'Enter a number'],
      ['<img src=x>', 'Enter a number'], ['0x10', 'Enter a number'], ['1e1', 'Enter a number'],
      ['0', '1 to 20'], ['-1', '1 to 20'], ['21', '1 to 20'],
      ['9'.repeat(1000), 'at most 32'],
    ];
    for (const [guess, message] of cases) {
      const result = submitGuess(round, guess);
      expect(result.round).toBe(round);
      expect(result.error).toContain(message);
    }
    expect(round.score).toBe(20);
  });

  it('deducts exactly one point and gives low and high feedback', () => {
    const first = submitGuess(makeRound(), '5');
    expect(first.round).toMatchObject({ score: 19, turns: 1, status: 'playing', highScore: 0 });
    expect(first.round.feedback).toContain('Too low');
    const second = submitGuess(first.round, '15');
    expect(second.round).toMatchObject({ score: 18, turns: 2, status: 'playing', highScore: 0 });
    expect(second.round.feedback).toContain('Too high');
    expect(submitGuess(second.round, '15').round.score).toBe(17);
  });

  it('wins without a score penalty and updates only the best high score', () => {
    const win = submitGuess(makeRound(), '10').round;
    expect(win).toMatchObject({ score: 20, turns: 1, status: 'won', highScore: 20 });
    const previousBest = makeRound(20);
    const lowerWin = submitGuess(submitGuess(previousBest, '1').round, '10').round;
    expect(lowerWin).toMatchObject({ status: 'won', score: 19, highScore: 20 });
  });

  it('loses on the twentieth incorrect guess without changing the high score', () => {
    let round: GuessRound = makeRound(18);
    for (let i = 0; i < 19; i++) round = submitGuess(round, '1').round;
    expect(round).toMatchObject({ score: 1, turns: 19, status: 'playing' });
    round = submitGuess(round, '20').round;
    expect(round).toMatchObject({ score: 0, turns: 20, status: 'lost', highScore: 18 });
    expect(round.feedback).toContain('You lost');
  });

  it('still wins when a correct guess is submitted with one point left', () => {
    let round: GuessRound = makeRound();
    for (let i = 0; i < 19; i++) round = submitGuess(round, '1').round;
    expect(submitGuess(round, '10').round).toMatchObject({ status: 'won', score: 1, highScore: 1 });
  });

  it('ignores all checks after win or loss', () => {
    const won = submitGuess(makeRound(), '10').round;
    let lost: GuessRound = makeRound();
    for (let i = 0; i < 20; i++) lost = submitGuess(lost, '1').round;
    for (const terminal of [won, lost]) {
      for (const guess of ['10', '1', '', 'bad']) {
        expect(submitGuess(terminal, guess)).toEqual({ round: terminal, error: '' });
        expect(submitGuess(terminal, guess).round).toBe(terminal);
      }
    }
  });

  it('restarts with a fresh draw and preserves high score', () => {
    const win = submitGuess(makeRound(), '10').round;
    let draws = 0;
    const restart = startRound(() => { draws++; return 0.95; }, win.highScore);
    expect(draws).toBe(1);
    expect(restart).toMatchObject({ secret: 20, score: 20, turns: 0, status: 'playing', highScore: 20 });
    expect(restart.feedback).toContain('new round');
  });
});
