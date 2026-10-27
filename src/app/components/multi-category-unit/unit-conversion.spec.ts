import { CATEGORIES, getCategory, getUnit } from './unit-config';
import { convertTargets, convertUnit, defaultConverterState, parseValue, switchCategory, switchSource } from './unit-conversion';
import { formatMeasurement } from './unit-format';

describe('unit configuration contracts', () => {
  it('defines separate dimensions with unique compatible units and invertible formulas', () => {
    expect(CATEGORIES.map((category) => category.id)).toEqual(['length', 'mass', 'temperature']);
    const ids = new Set<string>();
    for (const category of CATEGORIES) {
      expect(Object.isFrozen(category)).toBe(true);
      for (const unit of category.units) {
        expect(ids.has(unit.id)).toBe(false);
        ids.add(unit.id);
        expect(Number.isFinite(unit.scale)).toBe(true);
        expect(unit.scale).not.toBe(0);
        expect(Number.isFinite(unit.offset)).toBe(true);
        expect(Object.isFrozen(unit)).toBe(true);
      }
    }
    expect(ids.size).toBe(7);
  });

  it('rejects unknown categories and incompatible units', () => {
    expect(() => getCategory('unknown')).toThrow('supported category');
    expect(() => getUnit('length', 'kg')).toThrow('does not belong');
  });
});

describe('unit conversion', () => {
  it('matches the required anchors', () => {
    expect(convertUnit('length', 'cm', 'ft', 30.48)).toBeCloseTo(1, 12);
    expect(convertUnit('length', 'ft', 'in', 1)).toBeCloseTo(12, 12);
    expect(convertUnit('mass', 'kg', 'lb', 1)).toBeCloseTo(2.2046226218487757, 12);
    expect(convertUnit('temperature', 'c', 'f', 0)).toBeCloseTo(32, 12);
    expect(convertUnit('temperature', 'c', 'f', -40)).toBeCloseTo(-40, 12);
    expect(convertUnit('temperature', 'f', 'c', -40)).toBeCloseTo(-40, 12);
    expect(convertUnit('temperature', 'f', 'c', 32)).toBeCloseTo(0, 12);
  });

  it('converts every source to all compatible targets and round-trips each pair', () => {
    for (const category of CATEGORIES) {
      for (const source of category.units) {
        for (const value of [-40, 0, 1, 123.456789]) {
          const results = convertTargets(category.id, source.id, value);
          expect(results).toHaveLength(category.units.length - 1);
          for (const result of results) {
            expect(result.unit.id).not.toBe(source.id);
            expect(category.units).toContain(result.unit);
            expect(result.value).toBeCloseTo(convertUnit(category.id, source.id, result.unit.id, value), 10);
            expect(convertUnit(category.id, result.unit.id, source.id, result.value)).toBeCloseTo(value, 10);
          }
        }
      }
    }
  });

  it('blocks same-unit and cross-dimension conversions, including forged source units', () => {
    expect(() => convertUnit('length', 'cm', 'cm', 1)).toThrow('different target');
    expect(() => convertUnit('length', 'cm', 'kg', 1)).toThrow('does not belong');
    expect(() => convertTargets('temperature', 'kg', 1)).toThrow('does not belong');
    expect(() => convertUnit('mass', 'ft', 'lb', 1)).toThrow('does not belong');
  });

  it('validates non-finite values and conversion overflow', () => {
    for (const value of [NaN, Infinity, -Infinity]) {
      expect(() => convertTargets('mass', 'kg', value)).toThrow('finite');
    }
    expect(() => convertTargets('length', 'ft', 1e308)).toThrow('too large');
    expect(() => convertTargets('temperature', 'c', 1e308)).toThrow('too large');
  });

  it('derives unrounded results directly from the normalized value', () => {
    const results = convertTargets('length', 'cm', 1);
    expect(results[0].value).toBe(1 / 30.48);
    expect(results[1].value).toBe(1 / 2.54);
    expect(results[1].value).not.toBe(Number(formatMeasurement(results[0].value, 'en-US')) * 12);
  });
});

describe('converter state and validation', () => {
  it('distinguishes empty, invalid, and finite numeric input', () => {
    for (const raw of ['', '   ']) expect(parseValue(raw).status).toBe('empty');
    for (const raw of ['abc', '<img src=x>', 'NaN', 'Infinity', '1,5', '0x10', '1e309', '1'.repeat(129)]) {
      expect(parseValue(raw).status).toBe('invalid');
    }
    for (const [raw, expected] of [['0', 0], ['-40', -40], [' .5 ', 0.5], ['1e3', 1000], ['+2.5', 2.5]] as const) {
      expect(parseValue(raw)).toEqual({ status: 'valid', value: expected });
    }
  });

  it('clears raw values and chooses a compatible source through repeated category switches', () => {
    let state = { ...defaultConverterState(), rawValue: '30.48' };
    for (let i = 0; i < 10; i++) {
      for (const category of CATEGORIES) {
        if (state.category === category.id) continue;
        state = switchCategory(state, category.id);
        expect(state).toMatchObject({ category: category.id, source: category.units[0].id, rawValue: '' });
        state = { ...state, rawValue: '5' };
      }
    }
    expect(defaultConverterState()).toEqual({ category: 'length', source: 'cm', rawValue: '' });
  });

  it('clears values on source changes and blocks incompatible changes', () => {
    const state = { ...defaultConverterState(), rawValue: '30.48' };
    expect(switchSource(state, 'ft')).toEqual({ category: 'length', source: 'ft', rawValue: '' });
    expect(switchSource(state, 'cm')).toBe(state);
    expect(switchCategory(state, 'length')).toBe(state);
    expect(() => switchSource(state, 'kg')).toThrow('does not belong');
  });
});

describe('measurement formatting', () => {
  it('rounds only for display, formats by locale, and normalizes negative zero', () => {
    expect(formatMeasurement(2.2046226218487757, 'en-US')).toBe('2.204623');
    expect(formatMeasurement(1234.5, 'de-DE')).toBe('1.234,5');
    expect(formatMeasurement(-0.00000001, 'en-US')).toBe('0');
    expect(() => formatMeasurement(Infinity)).toThrow('finite');
  });
});
