export type StopwatchStatus = 'idle' | 'running' | 'paused';
export interface StopwatchSnapshot {
  readonly status: StopwatchStatus;
  readonly elapsed: number;
}

/** Hundredths are truncated for presentation; accumulated milliseconds remain unrounded.
 * Minutes are total elapsed minutes and may exceed 59.
 */
export function formatElapsed(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) throw new Error('Elapsed time must be finite and non-negative.');
  const hundredths = Math.floor(milliseconds / 10);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(Math.floor(hundredths / 6000))}:${pad(Math.floor(hundredths / 100) % 60)}.${pad(hundredths % 100)}`;
}

/** Rendering callbacks request a snapshot; they never increment elapsed time. */
export class StopwatchEngine {
  private status: StopwatchStatus = 'idle';
  private accumulated = 0;
  private startedAt: number | null = null;
  private frame: number | undefined;
  private generation = 0;
  private visible = true;
  private disposed = false;

  constructor(
    private readonly now: () => number,
    private readonly schedule: (callback: () => void) => number,
    private readonly cancel: (handle: number) => void,
    private readonly display: (snapshot: StopwatchSnapshot) => void,
  ) {}

  snapshot(): StopwatchSnapshot {
    return {
      status: this.status,
      elapsed: this.accumulated + (this.startedAt === null ? 0 : Math.max(0, this.now() - this.startedAt)),
    };
  }

  start(): void {
    if (this.disposed || this.status !== 'idle') return;
    this.startRun();
  }

  resume(): void {
    if (this.disposed || this.status !== 'paused') return;
    this.startRun();
  }

  private startRun(): void {
    this.startedAt = this.now();
    this.status = 'running';
    this.publish();
    this.scheduleNext();
  }

  pause(): void {
    if (this.disposed || this.status !== 'running') return;
    this.accumulated = this.snapshot().elapsed;
    this.startedAt = null;
    this.status = 'paused';
    this.cancelFrame();
    this.publish();
  }

  reset(): void {
    if (this.disposed) return;
    this.cancelFrame();
    this.clearRun();
    this.publish();
  }

  setVisible(visible: boolean): void {
    if (this.disposed || visible === this.visible) return;
    this.visible = visible;
    if (!visible) this.cancelFrame();
    this.publish();
    if (visible) this.scheduleNext();
  }

  destroy(): void {
    if (this.disposed) return;
    this.cancelFrame();
    this.clearRun();
    this.disposed = true;
  }

  private clearRun(): void {
    this.status = 'idle';
    this.accumulated = 0;
    this.startedAt = null;
  }

  private publish(): void { this.display(this.snapshot()); }

  private scheduleNext(): void {
    if (this.disposed || !this.visible || this.status !== 'running' || this.frame !== undefined) return;
    const generation = this.generation;
    this.frame = this.schedule(() => {
      // Also ignore an already-queued callback from a canceled run.
      if (this.disposed || generation !== this.generation) return;
      this.frame = undefined;
      this.publish();
      this.scheduleNext();
    });
  }

  private cancelFrame(): void {
    this.generation++;
    if (this.frame !== undefined) this.cancel(this.frame);
    this.frame = undefined;
  }
}
