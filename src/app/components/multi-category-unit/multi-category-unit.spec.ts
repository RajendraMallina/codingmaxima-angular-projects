import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CATEGORIES } from './unit-config';
import { MultiCategoryUnit } from './multi-category-unit';

describe('MultiCategoryUnit', () => {
  let fixture: ComponentFixture<MultiCategoryUnit>;
  async function render() {
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
  }
  function root(): HTMLElement { return fixture.nativeElement; }
  function input(): HTMLInputElement { return root().querySelector('#unit-value')!; }
  function source(): HTMLSelectElement { return root().querySelector('#source-unit')!; }
  async function enter(value: string) {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    await render();
  }
  async function category(id: string) {
    (root().querySelector(`input[name="unit-category"][value="${id}"]`) as HTMLInputElement).click();
    await render();
  }
  async function unit(id: string) {
    source().value = id;
    source().dispatchEvent(new Event('change'));
    await render();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MultiCategoryUnit] }).compileComponents();
    fixture = TestBed.createComponent(MultiCategoryUnit);
    fixture.detectChanges();
    await render();
  });

  it('starts with Length, associated labels, and no misleading results', () => {
    expect(source().value).toBe('cm');
    expect((root().querySelector('input[value="length"]') as HTMLInputElement).checked).toBe(true);
    expect(root().querySelector('label[for="unit-value"]')?.textContent).toContain('Centimeters');
    expect(input().getAttribute('aria-describedby')).toContain('input-error');
    expect(root().querySelectorAll('output')).toHaveLength(0);
    expect(root().textContent).toContain('Enter a value');
  });

  it('converts all seven source units and only displays compatible targets', async () => {
    for (const item of CATEGORIES) {
      await category(item.id);
      expect(Array.from(source().options).map((option) => option.value)).toEqual(item.units.map((entry) => entry.id));
      for (const entry of item.units) {
        await unit(entry.id);
        await enter(item.id === 'temperature' ? '-40' : '1');
        const targets = Array.from(root().querySelectorAll('[data-unit]')).map((card) => card.getAttribute('data-unit'));
        expect(targets).toEqual(item.units.filter((target) => target.id !== entry.id).map((target) => target.id));
        expect(root().querySelector('label[for="unit-value"]')?.textContent).toContain(entry.label);
      }
    }
  });

  it('clears input and results, updates help, and restores useful focus after switching and reset', async () => {
    document.body.appendChild(root());
    await enter('30.48');
    expect(root().querySelector('[data-unit="ft"] output')?.textContent).toBe('1 ft');
    await category('temperature');
    expect(input().value).toBe('');
    expect(root().querySelectorAll('output')).toHaveLength(0);
    expect(root().querySelector('#category-help')?.textContent).toContain('offset');
    expect(document.activeElement).toBe(input());
    await enter('0');
    expect(root().querySelector('output')?.textContent).toBe('32 °F');
    await unit('f');
    expect(input().value).toBe('');
    expect(root().querySelectorAll('output')).toHaveLength(0);
    await enter('-40');
    expect(root().querySelector('output')?.textContent).toBe('-40 °C');
    await category('mass');
    await enter('1');
    expect(root().querySelector('output')?.textContent).toContain('2.204623');
    (root().querySelector('.reset') as HTMLButtonElement).click();
    await render();
    expect(source().value).toBe('cm');
    expect(input().value).toBe('');
    expect(root().querySelectorAll('output')).toHaveLength(0);
    expect(root().querySelector('h2')?.textContent).toBe('Length conversion');
    expect(document.activeElement).toBe(input());
    root().remove();
  });

  it('handles empty, invalid, oversized, and untrusted input as text', async () => {
    for (const value of ['<script>alert(1)</script>', 'abc', 'NaN', '1e309']) {
      await enter(value);
      expect(input().getAttribute('aria-invalid')).toBe('true');
      expect(root().querySelector('#input-error')?.textContent).not.toBe('');
      expect(root().querySelectorAll('output')).toHaveLength(0);
      expect(root().querySelector('script, img')).toBeNull();
    }
    await enter('');
    expect(input().getAttribute('aria-invalid')).toBeNull();
    expect(root().querySelector('#input-error')?.textContent).toBe('');
    await unit('ft');
    await enter('1e308');
    expect(root().querySelector('#input-error')?.textContent).toContain('too large');
    expect(root().querySelectorAll('output')).toHaveLength(0);
  });

  it('handles repeated category switches without stale results or duplicate controls', async () => {
    for (let i = 0; i < 10; i++) {
      for (const item of CATEGORIES) {
        await category(item.id);
        await enter('1');
      }
    }
    expect(root().querySelectorAll('#unit-value')).toHaveLength(1);
    expect(root().querySelectorAll('#source-unit')).toHaveLength(1);
    expect(root().querySelectorAll('input[name="unit-category"]')).toHaveLength(3);
    expect(root().querySelector('h2')?.textContent).toBe('Temperature conversion');
    expect(root().querySelector('output')?.textContent).toBe('33.8 °F');
  });
});
