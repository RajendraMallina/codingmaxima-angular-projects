export type ClockFormat = '12' | '24';

export function formatLocalTime(timestamp: number, format: ClockFormat): string {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const pad = (value: number) => String(value).padStart(2, '0');
  const time = `${pad(format === '12' ? hour % 12 || 12 : hour)}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return format === '12' ? `${time} ${hour >= 12 ? 'PM' : 'AM'}` : time;
}

/** Every tick reads wall time again; timeout delays never become elapsed-time counters. */
export class SystemClock {
  private timer: number | undefined;
  private running = false;

  constructor(
    private readonly now: () => number,
    private readonly schedule: (callback: () => void, delay: number) => number,
    private readonly cancel: (handle: number) => void,
    private readonly display: (timestamp: number) => void,
  ) {}

  start(): void {
    this.running = true;
    this.refresh();
  }

  refresh(): void {
    if (!this.running) return;
    if (this.timer !== undefined) this.cancel(this.timer);
    const timestamp = this.now();
    this.display(timestamp);
    // Re-align to the next wall-clock second after every callback or clock change.
    const milliseconds = ((timestamp % 1000) + 1000) % 1000;
    this.timer = this.schedule(() => this.refresh(), 1000 - milliseconds);
  }

  stop(): void {
    this.running = false;
    if (this.timer !== undefined) this.cancel(this.timer);
    this.timer = undefined;
  }
}
