import { formatLocalTime, SystemClock } from './system-clock';

describe('SystemClock', () => {
  function setup() {
    let now = 1250;
    let nextHandle = 0;
    const pending = new Map<number, { callback: () => void; delay: number }>();
    const displayed: number[] = [];
    const clock = new SystemClock(
      () => now,
      (callback, delay) => { pending.set(++nextHandle, { callback, delay }); return nextHandle; },
      (handle) => { pending.delete(handle); },
      (value) => displayed.push(value),
    );
    return {
      clock, pending, displayed,
      setTime: (value: number) => { now = value; },
      tick: () => {
        const [handle, task] = [...pending.entries()][0];
        pending.delete(handle);
        task.callback();
      },
    };
  }

  it('reads the system time immediately and aligns to the next second', () => {
    const state = setup();
    state.clock.start();
    expect(state.displayed).toEqual([1250]);
    expect([...state.pending.values()][0].delay).toBe(750);
  });

  it('recovers from a delayed callback rather than incrementing a counter', () => {
    const state = setup();
    state.clock.start();
    state.setTime(98765);
    state.tick();
    expect(state.displayed.at(-1)).toBe(98765);
    expect([...state.pending.values()][0].delay).toBe(235);
    expect(state.pending.size).toBe(1);
  });

  it('handles forward and backward system clock changes', () => {
    const state = setup();
    state.clock.start();
    for (const timestamp of [3600500, 250, 1000]) {
      state.setTime(timestamp);
      state.tick();
      expect(state.displayed.at(-1)).toBe(timestamp);
      expect(state.pending.size).toBe(1);
    }
    expect([...state.pending.values()][0].delay).toBe(1000);
  });

  it('refreshes immediately on resume without accumulating timers', () => {
    const state = setup();
    state.clock.start();
    state.setTime(7200001);
    for (let i = 0; i < 20; i++) state.clock.refresh();
    expect(state.displayed.at(-1)).toBe(7200001);
    expect(state.pending.size).toBe(1);
  });

  it('stops timers and ignores a callback already queued at destruction', () => {
    const state = setup();
    state.clock.start();
    const stale = [...state.pending.values()][0].callback;
    state.clock.stop();
    stale();
    state.clock.refresh();
    expect(state.pending.size).toBe(0);
    expect(state.displayed).toEqual([1250]);
  });
});

describe('formatLocalTime', () => {
  it('formats midnight and noon in both presentations', () => {
    const midnight = new Date(2026, 0, 1, 0, 0, 0).getTime();
    const noon = new Date(2026, 0, 1, 12, 0, 0).getTime();
    expect(formatLocalTime(midnight, '12')).toBe('12:00:00 AM');
    expect(formatLocalTime(midnight, '24')).toBe('00:00:00');
    expect(formatLocalTime(noon, '12')).toBe('12:00:00 PM');
    expect(formatLocalTime(noon, '24')).toBe('12:00:00');
  });

  it('pads minutes and seconds and handles the day boundary', () => {
    expect(formatLocalTime(new Date(2026, 0, 1, 13, 2, 3).getTime(), '12')).toBe('01:02:03 PM');
    expect(formatLocalTime(new Date(2026, 0, 1, 23, 59, 59).getTime(), '24')).toBe('23:59:59');
    expect(formatLocalTime(new Date(2026, 0, 2, 0, 0, 0).getTime(), '24')).toBe('00:00:00');
  });
});
