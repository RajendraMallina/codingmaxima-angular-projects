import { formatElapsed, StopwatchEngine, StopwatchSnapshot } from './stopwatch-engine';

describe('StopwatchEngine', () => {
  function setup() {
    let now = 100;
    let handle = 0;
    const pending = new Map<number, () => void>();
    const displayed: StopwatchSnapshot[] = [];
    const engine = new StopwatchEngine(
      () => now,
      (callback) => { pending.set(++handle, callback); return handle; },
      (id) => { pending.delete(id); },
      (snapshot) => displayed.push(snapshot),
    );
    return {
      engine, pending, displayed,
      setTime: (value: number) => { now = value; },
      frame: () => {
        const [id, callback] = [...pending.entries()][0];
        pending.delete(id);
        callback();
      },
    };
  }

  it('starts from exact zero and repeated start cannot add schedulers or reset the timestamp', () => {
    const state = setup();
    expect(state.engine.snapshot()).toEqual({ status: 'idle', elapsed: 0 });
    state.engine.start();
    state.setTime(1100);
    state.engine.start();
    expect(state.engine.snapshot()).toEqual({ status: 'running', elapsed: 1000 });
    expect(state.pending.size).toBe(1);
  });

  it('renders actual elapsed duration after a delayed callback and minute rollover', () => {
    const state = setup();
    state.engine.start();
    state.setTime(61445);
    state.frame();
    expect(state.displayed.at(-1)?.elapsed).toBe(61345);
    expect(formatElapsed(state.displayed.at(-1)!.elapsed)).toBe('01:01.34');
    expect(state.pending.size).toBe(1);
  });

  it('pauses exactly, ignores repeated pause, and excludes a long pause on resume', () => {
    const state = setup();
    state.engine.start();
    state.setTime(1334.567);
    state.engine.pause();
    const elapsed = state.engine.snapshot().elapsed;
    expect(elapsed).toBeCloseTo(1234.567, 8);
    expect(state.pending.size).toBe(0);
    state.setTime(1000000);
    state.engine.pause();
    expect(state.engine.snapshot()).toEqual({ status: 'paused', elapsed });
    state.engine.start();
    expect(state.pending.size).toBe(0); // Paused runs require resume.
    state.engine.resume();
    state.engine.resume();
    expect(state.pending.size).toBe(1);
    state.setTime(1001000);
    state.frame();
    expect(state.engine.snapshot().elapsed).toBeCloseTo(2234.567, 8);
  });

  it('resets to exact zero from every state and reset is idempotent', () => {
    for (const status of ['idle', 'running', 'paused']) {
      const state = setup();
      if (status !== 'idle') state.engine.start();
      state.setTime(10000);
      if (status === 'paused') state.engine.pause();
      state.engine.reset();
      state.engine.reset();
      expect(state.engine.snapshot()).toEqual({ status: 'idle', elapsed: 0 });
      expect(state.pending.size).toBe(0);
      state.engine.start();
      state.setTime(10100);
      expect(state.engine.snapshot().elapsed).toBe(100);
    }
  });

  it('stops visual work while hidden and immediately catches up on return', () => {
    const state = setup();
    state.engine.start();
    state.setTime(1100);
    state.engine.setVisible(false);
    expect(state.pending.size).toBe(0);
    state.setTime(3600100);
    state.engine.setVisible(true);
    expect(state.displayed.at(-1)).toEqual({ status: 'running', elapsed: 3600000 });
    expect(state.pending.size).toBe(1);
    state.engine.setVisible(true);
    expect(state.pending.size).toBe(1);
  });

  it('handles start, pause, resume, and reset while hidden without scheduling', () => {
    const state = setup();
    state.engine.setVisible(false);
    state.engine.start();
    state.setTime(1100);
    state.engine.pause();
    state.setTime(9100);
    state.engine.resume();
    state.setTime(10100);
    expect(state.engine.snapshot()).toEqual({ status: 'running', elapsed: 2000 });
    expect(state.pending.size).toBe(0);
    state.engine.reset();
    state.engine.setVisible(true);
    expect(state.pending.size).toBe(0);
    expect(state.engine.snapshot().elapsed).toBe(0);
  });

  it('does no visual work on visibility changes while paused', () => {
    const state = setup();
    state.engine.start();
    state.setTime(500);
    state.engine.pause();
    state.engine.setVisible(false);
    state.setTime(50000);
    state.engine.setVisible(true);
    expect(state.engine.snapshot()).toEqual({ status: 'paused', elapsed: 400 });
    expect(state.pending.size).toBe(0);
  });

  it('ignores already-queued stale callbacks after reset and restart', () => {
    const state = setup();
    state.engine.start();
    const stale = [...state.pending.values()][0];
    state.engine.reset();
    state.engine.start();
    const count = state.displayed.length;
    stale();
    expect(state.pending.size).toBe(1);
    expect(state.displayed).toHaveLength(count);
  });

  it('cleans up a running timer and run data and ignores all actions after destruction', () => {
    const state = setup();
    state.engine.start();
    const stale = [...state.pending.values()][0];
    state.setTime(10000);
    const count = state.displayed.length;
    state.engine.destroy();
    state.engine.destroy();
    stale();
    state.engine.start();
    state.engine.resume();
    state.engine.pause();
    state.engine.reset();
    state.engine.setVisible(true);
    expect(state.pending.size).toBe(0);
    expect(state.engine.snapshot()).toEqual({ status: 'idle', elapsed: 0 });
    expect(state.displayed).toHaveLength(count);
  });

  it('excludes wall-clock jumps because only the injected monotonic source is read', () => {
    const state = setup();
    state.engine.start();
    const original = Date.now;
    try {
      Date.now = () => -999999999;
      state.setTime(250);
      state.frame();
      expect(state.engine.snapshot().elapsed).toBe(150);
      Date.now = () => 9999999999999;
      state.setTime(500);
      state.frame();
      expect(state.engine.snapshot().elapsed).toBe(400);
    } finally {
      Date.now = original;
    }
  });
});

describe('formatElapsed', () => {
  it('pads fields, truncates hundredths, and handles minute rollover and long runs', () => {
    expect(formatElapsed(0)).toBe('00:00.00');
    expect(formatElapsed(9.999)).toBe('00:00.00');
    expect(formatElapsed(10)).toBe('00:00.01');
    expect(formatElapsed(59999)).toBe('00:59.99');
    expect(formatElapsed(60000)).toBe('01:00.00');
    expect(formatElapsed(3600000)).toBe('60:00.00');
    expect(formatElapsed(6000000)).toBe('100:00.00');
    for (const value of [-1, NaN, Infinity]) expect(() => formatElapsed(value)).toThrow('finite');
  });
});
