import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KilogramsPounds } from './kilograms-pounds';

describe('KilogramsPounds', () => {
  let fixture: ComponentFixture<KilogramsPounds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KilogramsPounds] }).compileComponents();
    fixture = TestBed.createComponent(KilogramsPounds);
    await fixture.whenStable();
  });

  async function enterWeight(id: string, value: string) {
    const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  function weight(id: string): HTMLInputElement {
    return fixture.nativeElement.querySelector(`#${id}`);
  }

  it('should convert kilograms to pounds', async () => {
    await enterWeight('kilograms', '10');
    expect(weight('pounds').valueAsNumber).toBeCloseTo(22.0462262185, 8);
  });

  it('should convert pounds to kilograms', async () => {
    await enterWeight('pounds', '1');
    expect(weight('kilograms').valueAsNumber).toBeCloseTo(0.45359237, 8);
  });

  it('should accept zero', async () => {
    await enterWeight('kilograms', '0');
    expect(weight('pounds').valueAsNumber).toBe(0);
  });

  it('should clear the conversion when the input is cleared', async () => {
    await enterWeight('kilograms', '10');
    await enterWeight('kilograms', '');
    expect(weight('pounds').value).toBe('');
  });

  it('should reject negative weights', async () => {
    await enterWeight('pounds', '-1');
    expect(weight('kilograms').value).toBe('');
    expect(fixture.nativeElement.querySelector('.result').textContent).toContain('non-negative');
  });
});
