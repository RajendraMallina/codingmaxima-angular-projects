import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, computed, DestroyRef, inject, NgZone, signal } from '@angular/core';
import { ClockFormat, formatLocalTime, SystemClock } from './system-clock';

@Component({
  selector: 'app-digital-clock',
  templateUrl: './digital-clock.html',
  styleUrl: './digital-clock.css',
})
export class DigitalClock {
  protected readonly format = signal<ClockFormat>('24');
  protected readonly timestamp = signal<number | null>(null);
  protected readonly time = computed(() => {
    const timestamp = this.timestamp();
    return timestamp === null ? '--:--:--' : formatLocalTime(timestamp, this.format());
  });
  protected readonly date = computed(() => {
    const timestamp = this.timestamp();
    return timestamp === null ? '' : new Date(timestamp).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  });
  protected readonly isoTime = computed(() => {
    const timestamp = this.timestamp();
    return timestamp === null ? null : new Date(timestamp).toISOString();
  });
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private clock?: SystemClock;

  constructor() {
    // Server rendering uses a placeholder; local time starts only in the user's browser.
    afterNextRender(() => {
      const browser = this.document.defaultView;
      if (!browser) return;
      this.clock = new SystemClock(
        () => Date.now(),
        (callback, delay) => browser.setTimeout(callback, delay),
        (handle) => browser.clearTimeout(handle),
        (timestamp) => this.timestamp.set(timestamp),
      );
      const refresh = () => this.zone.runOutsideAngular(() => this.clock?.refresh());
      const visible = () => {
        if (this.document.visibilityState === 'visible') refresh();
      };
      this.document.addEventListener('visibilitychange', visible);
      browser.addEventListener('focus', refresh);
      browser.addEventListener('pageshow', refresh);
      this.zone.runOutsideAngular(() => this.clock!.start());
      this.destroyRef.onDestroy(() => {
        this.clock?.stop();
        this.document.removeEventListener('visibilitychange', visible);
        browser.removeEventListener('focus', refresh);
        browser.removeEventListener('pageshow', refresh);
      });
    });
  }

  protected selectFormat(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value === '12' || value === '24') {
      this.format.set(value);
      this.zone.runOutsideAngular(() => this.clock?.refresh());
    }
  }
}
