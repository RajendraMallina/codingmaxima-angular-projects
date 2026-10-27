import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { DigitalClock } from './digital-clock';

describe('DigitalClock', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('shows local time, changes format, and refreshes on visibility, focus, and pageshow', async () => {
    let now = new Date(2026, 0, 1, 13, 2, 3).getTime();
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    await TestBed.configureTestingModule({ imports: [DigitalClock] }).compileComponents();
    const fixture = TestBed.createComponent(DigitalClock);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('time')?.textContent).toBe('13:02:03');
    const radio = root.querySelector('input[value="12"]') as HTMLInputElement;
    radio.click();
    fixture.detectChanges();
    expect(root.querySelector('time')?.textContent).toBe('01:02:03 PM');
    expect(root.querySelector('time')?.getAttribute('aria-live')).toBe('off');

    now = new Date(2026, 0, 1, 15, 20, 30).getTime();
    window.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(root.querySelector('time')?.textContent).toBe('03:20:30 PM');
    now = new Date(2026, 0, 1, 8, 10, 20).getTime();
    window.dispatchEvent(new Event('pageshow'));
    fixture.detectChanges();
    expect(root.querySelector('time')?.textContent).toBe('08:10:20 AM');
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    now = new Date(2026, 0, 2, 0, 0, 0).getTime();
    document.dispatchEvent(new Event('visibilitychange'));
    fixture.detectChanges();
    expect(root.querySelector('time')?.textContent).toBe('12:00:00 AM');
    const removeDocument = vi.spyOn(document, 'removeEventListener');
    const removeWindow = vi.spyOn(window, 'removeEventListener');
    const clearTimer = vi.spyOn(window, 'clearTimeout');
    fixture.destroy();
    expect(removeDocument).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(removeWindow).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(removeWindow).toHaveBeenCalledWith('pageshow', expect.any(Function));
    expect(clearTimer).toHaveBeenCalled();
  });
});
