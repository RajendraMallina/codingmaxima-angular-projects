import { InjectionToken } from '@angular/core';

export const STOPWATCH_NOW = new InjectionToken<() => number>('Monotonic stopwatch clock', {
  providedIn: 'root',
  factory: () => () => performance.now(),
});
