import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CentimeterFeetsInches } from './centimeter-feets-inches';

describe('CentimeterFeetsInches', () => {
  let fixture: ComponentFixture<CentimeterFeetsInches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CentimeterFeetsInches] }).compileComponents();
    fixture = TestBed.createComponent(CentimeterFeetsInches);
    await fixture.whenStable();
  });

  function input(id: string): HTMLInputElement {
    return fixture.nativeElement.querySelector(`#${id}`);
  }

  async function enter(id: string, value: string) {
    input(id).value = value;
    input(id).dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  it('should split centimeters into feet and remaining inches', async () => {
    await enter('centimeters', '180');
    expect(input('feet').valueAsNumber).toBe(5);
    expect(input('inches').valueAsNumber).toBeCloseTo(10.866142, 6);
  });

  it('should convert combined feet and fractional inches to centimeters', async () => {
    await enter('feet', '5');
    await enter('inches', '6.5');
    expect(input('centimeters').valueAsNumber).toBeCloseTo(168.91, 8);
  });

  it('should convert inches alone', async () => {
    await enter('inches', '12');
    expect(input('centimeters').valueAsNumber).toBeCloseTo(30.48, 8);
  });

  it('should handle zero and exact foot boundaries', async () => {
    await enter('centimeters', '30.48');
    expect(input('feet').valueAsNumber).toBe(1);
    expect(input('inches').valueAsNumber).toBe(0);
    await enter('centimeters', '0');
    expect(input('feet').valueAsNumber).toBe(0);
    expect(input('inches').valueAsNumber).toBe(0);
  });

  it('should clear all fields when centimeters are cleared', async () => {
    await enter('centimeters', '180');
    await enter('centimeters', '');
    expect(input('feet').value).toBe('');
    expect(input('inches').value).toBe('');
  });

  it('should clear centimeters when both imperial fields are cleared', async () => {
    await enter('feet', '5');
    await enter('inches', '6');
    await enter('feet', '');
    await enter('inches', '');
    expect(input('centimeters').value).toBe('');
  });

  it('should reject negative inches and fractional feet', async () => {
    await enter('inches', '-1');
    expect(input('centimeters').value).toBe('');
    await enter('inches', '0');
    await enter('feet', '1.5');
    expect(input('centimeters').value).toBe('');
    expect(fixture.nativeElement.querySelector('.result').textContent).toContain('whole number');
  });
});
