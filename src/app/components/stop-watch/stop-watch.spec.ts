import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { STOPWATCH_NOW } from './stopwatch-clock';
import { StopWatch } from './stop-watch';

describe('StopWatch', () => {
  let fixture: ComponentFixture<StopWatch>;
  let now = 100;
  function root(): HTMLElement { return fixture.nativeElement; }
  function button(name: string): HTMLButtonElement {
    return Array.from(root().querySelectorAll('button')).find((item) => item.textContent?.trim() === name)!;
  }
  async function render() {
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
  }
  async function click(name: string) { button(name).click(); await render(); }
  function time(): string { return root().querySelector('[role="timer"]')!.textContent!.trim(); }

  beforeEach(async () => {
    now = 100;
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    await TestBed.configureTestingModule({
      imports: [StopWatch], providers: [{ provide: STOPWATCH_NOW, useValue: () => now }],
    }).compileComponents();
    fixture = TestBed.createComponent(StopWatch);
    fixture.detectChanges();
    await render();
  });
  afterEach(() => { fixture.destroy(); vi.restoreAllMocks(); });

  it('shows the initial zero display and valid control states without live digit announcements', () => {
    expect(time()).toBe('00:00.00');
    expect(button('Start').disabled).toBe(false);
    expect(button('Pause').disabled).toBe(true);
    expect(button('Reset').disabled).toBe(false);
    expect(root().querySelector('[role="timer"]')?.getAttribute('aria-live')).toBe('off');
    expect(root().querySelector('[role="status"]')?.textContent).toBe('Ready');
  });

  it('supports start, pause, resume, reset, and useful focus with a fake time source', async () => {
    document.body.appendChild(root());
    await click('Start');
    expect(button('Start').disabled).toBe(true);
    expect(button('Pause').disabled).toBe(false);
    expect(document.activeElement).toBe(button('Pause'));
    now = 61345;
    await click('Pause');
    expect(time()).toBe('01:01.24');
    expect(button('Resume').disabled).toBe(false);
    expect(button('Pause').disabled).toBe(true);
    expect(document.activeElement).toBe(button('Resume'));
    now = 1000000;
    await click('Resume');
    now = 1001000;
    await click('Pause');
    expect(time()).toBe('01:02.24');
    await click('Reset');
    expect(time()).toBe('00:00.00');
    expect(document.activeElement).toBe(button('Start'));
    await click('Reset');
    expect(time()).toBe('00:00.00');
    root().remove();
  });

  it('catches up on visibility return, cancels visual work while hidden, and resets while running', async () => {
    await click('Start');
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await render();
    expect(cancel).toHaveBeenCalled();
    now = 60100;
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await render();
    expect(time()).toBe('01:00.00');
    await click('Reset');
    expect(time()).toBe('00:00.00');
    expect(button('Pause').disabled).toBe(true);
  });

  it('cancels scheduling and removes its visibility listener on destruction while running', async () => {
    await click('Start');
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    const remove = vi.spyOn(document, 'removeEventListener');
    fixture.destroy();
    expect(cancel).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });
});
