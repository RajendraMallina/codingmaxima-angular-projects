import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CentimeterFeets } from './centimeter-feets';

describe('CentimeterFeets', () => {
  let fixture: ComponentFixture<CentimeterFeets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CentimeterFeets] }).compileComponents();
    fixture = TestBed.createComponent(CentimeterFeets);
    await fixture.whenStable();
  });

  async function enterLength(id: string, value: string) {
    const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  function length(id: string): HTMLInputElement {
    return fixture.nativeElement.querySelector(`#${id}`);
  }

  it('should convert centimeters to decimal feet', async () => {
    await enterLength('centimeters', '100');
    expect(length('feet').valueAsNumber).toBeCloseTo(3.280839895, 8);
  });

  it('should convert feet to centimeters', async () => {
    await enterLength('feet', '5.5');
    expect(length('centimeters').valueAsNumber).toBeCloseTo(167.64, 8);
  });

  it('should accept zero', async () => {
    await enterLength('centimeters', '0');
    expect(length('feet').valueAsNumber).toBe(0);
  });

  it('should clear the conversion when the input is cleared', async () => {
    await enterLength('centimeters', '100');
    await enterLength('centimeters', '');
    expect(length('feet').value).toBe('');
  });

  it('should reject negative lengths', async () => {
    await enterLength('feet', '-1');
    expect(length('centimeters').value).toBe('');
    expect(fixture.nativeElement.querySelector('.result').textContent).toContain('non-negative');
  });
});
