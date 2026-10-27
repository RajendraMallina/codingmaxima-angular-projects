import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, computed, DestroyRef, inject, Injector, NgZone, signal } from '@angular/core';
import { STOPWATCH_NOW } from './stopwatch-clock';
import { formatElapsed, StopwatchEngine, StopwatchSnapshot } from './stopwatch-engine';

@Component({
  selector: 'app-stop-watch',
  templateUrl: './stop-watch.html',
  styleUrl: './stop-watch.css',
})
export class StopWatch {
  protected readonly snapshot = signal<StopwatchSnapshot>({ status: 'idle', elapsed: 0 });
  protected readonly ready = signal(false);
  protected readonly display = computed(() => formatElapsed(this.snapshot().elapsed));
  protected readonly statusText = computed(() => {
    switch (this.snapshot().status) {
      case 'running': return 'Running';
      case 'paused': return 'Paused';
      default: return 'Ready';
    }
  });
  private readonly now = inject(STOPWATCH_NOW);
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private engine?: StopwatchEngine;

  constructor() {
    afterNextRender(() => {
      const browser = this.document.defaultView;
      if (!browser) return;
      this.engine = new StopwatchEngine(
        this.now,
        (callback) => browser.requestAnimationFrame(callback),
        (handle) => browser.cancelAnimationFrame(handle),
        (snapshot) => this.snapshot.set(snapshot),
      );
      const visibilityChanged = () => this.zone.runOutsideAngular(() =>
        this.engine?.setVisible(this.document.visibilityState !== 'hidden'));
      visibilityChanged();
      this.document.addEventListener('visibilitychange', visibilityChanged);
      this.ready.set(true);
      this.destroyRef.onDestroy(() => {
        this.engine?.destroy();
        this.document.removeEventListener('visibilitychange', visibilityChanged);
      });
    });
  }

  protected startOrResume(pauseButton: HTMLButtonElement): void {
    if (!this.engine || this.snapshot().status === 'running') return;
    this.zone.runOutsideAngular(() => {
      if (this.snapshot().status === 'paused') this.engine!.resume();
      else this.engine!.start();
    });
    this.focus(pauseButton);
  }

  protected pause(startButton: HTMLButtonElement): void {
    if (this.snapshot().status !== 'running') return;
    this.engine?.pause();
    this.focus(startButton);
  }

  protected reset(startButton: HTMLButtonElement): void {
    this.engine?.reset();
    this.focus(startButton);
  }

  private focus(button: HTMLButtonElement): void {
    afterNextRender(() => {
      if (!this.destroyRef.destroyed) button.focus();
    }, { injector: this.injector });
  }
}
