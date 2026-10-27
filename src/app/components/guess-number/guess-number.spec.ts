import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GUESS_RANDOM_SOURCE, GuessSession } from './guess-session';
import { GuessNumber } from './guess-number';

describe('GuessNumber', () => {
  let fixture: ComponentFixture<GuessNumber>;
  let nextRandom = 0.45;

  async function render() {
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
  }
  function root(): HTMLElement { return fixture.nativeElement; }
  function input(): HTMLInputElement { return root().querySelector('#guess')!; }
  function score(): string { return root().querySelector('[data-testid="score"]')!.textContent!.trim(); }
  function feedback(): string { return root().querySelector('#feedback')!.textContent!; }
  async function submit(value: string) {
    input().value = value;
    root().querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await render();
  }

  beforeEach(async () => {
    nextRandom = 0.45;
    await TestBed.configureTestingModule({
      imports: [GuessNumber],
      providers: [{ provide: GUESS_RANDOM_SOURCE, useValue: () => nextRandom }],
    }).compileComponents();
    fixture = TestBed.createComponent(GuessNumber);
    fixture.detectChanges();
    await render();
  });

  it('labels the input, uses a real form, announces feedback politely, and conceals the secret', () => {
    expect(root().querySelector('label')?.getAttribute('for')).toBe('guess');
    expect(root().querySelector('button[type="submit"]')?.textContent).toContain('Check guess');
    expect(root().querySelector('#feedback')?.getAttribute('aria-live')).toBe('polite');
    expect(root().querySelector('.secret')?.textContent?.trim()).toBe('?');
    expect(root().querySelector('.secret')?.getAttribute('aria-label')).toBe('Secret number hidden');
  });

  it('keeps invalid input from changing score and renders untrusted input safely', async () => {
    await submit('<img src=x onerror=alert(1)>');
    expect(score()).toBe('20');
    expect(feedback()).toContain('Enter a number');
    expect(root().querySelector('img, script')).toBeNull();
    expect(input().getAttribute('aria-invalid')).toBe('true');
    await submit('5');
    expect(score()).toBe('19');
    expect(feedback()).toContain('Too low');
    expect(input().getAttribute('aria-invalid')).toBeNull();
    expect(root().querySelector('.secret')?.textContent?.trim()).toBe('?');
  });

  it('keeps focus after feedback and moves it to restart after winning', async () => {
    document.body.appendChild(root());
    await submit('5');
    expect(document.activeElement).toBe(input());
    await submit('10');
    expect(feedback()).toContain('You won');
    expect(root().querySelector('.secret')?.textContent?.trim()).toBe('10');
    expect(score()).toBe('19');
    expect(root().querySelector('[data-testid="high-score"]')?.textContent).toBe('19');
    expect((root().querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true);
    expect(input().disabled).toBe(true);
    const restart = root().querySelector('.restart') as HTMLButtonElement;
    expect(document.activeElement).toBe(restart);
    await submit('1');
    expect(score()).toBe('19');
    nextRandom = 0.95;
    restart.click();
    await render();
    expect(score()).toBe('20');
    expect(input().value).toBe('');
    expect(input().disabled).toBe(false);
    expect(document.activeElement).toBe(input());
    expect(root().querySelector('.secret')?.textContent?.trim()).toBe('?');
    expect(root().querySelector('[data-testid="high-score"]')?.textContent).toBe('19');
    await submit('20');
    expect(feedback()).toContain('You won');
    root().remove();
  });

  it('shows loss in text, reveals the secret, and ignores further checks', async () => {
    for (let i = 0; i < 20; i++) await submit('1');
    expect(score()).toBe('0');
    expect(feedback()).toContain('You lost');
    expect(feedback()).toContain('secret number was 10');
    await submit('10');
    expect(score()).toBe('0');
    expect(feedback()).toContain('You lost');
    expect(TestBed.inject(GuessSession).highScore()).toBe(0);
  });

  it('retains the session best when the routed component is recreated', async () => {
    await submit('10');
    fixture.destroy();
    fixture = TestBed.createComponent(GuessNumber);
    fixture.detectChanges();
    await render();
    expect(score()).toBe('20');
    expect(root().querySelector('[data-testid="high-score"]')?.textContent).toBe('20');
    expect(root().querySelector('.secret')?.textContent?.trim()).toBe('?');
  });
});
