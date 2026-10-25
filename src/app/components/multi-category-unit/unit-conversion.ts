import { CategoryId, getCategory, getUnit, UnitDefinition, UnitId } from './unit-config';

export interface ConverterState {
  readonly category: CategoryId;
  readonly source: UnitId;
  readonly rawValue: string;
}
export interface ConversionResult {
  readonly unit: UnitDefinition;
  readonly value: number;
}
export type ParsedValue = { readonly status: 'empty' } |
  { readonly status: 'invalid'; readonly message: string } |
  { readonly status: 'valid'; readonly value: number };

export function defaultConverterState(): ConverterState {
  return { category: 'length', source: 'cm', rawValue: '' };
}

export function switchCategory(state: ConverterState, id: string): ConverterState {
  const category = getCategory(id);
  if (state.category === category.id) return state;
  return { category: category.id, source: category.units[0].id, rawValue: '' };
}

export function switchSource(state: ConverterState, id: string): ConverterState {
  const source = getUnit(state.category, id);
  if (state.source === source.id) return state;
  return { ...state, source: source.id, rawValue: '' };
}

export function parseValue(raw: string): ParsedValue {
  if (raw.length > 128) return { status: 'invalid', message: 'Enter a number using at most 128 characters.' };
  const text = raw.trim();
  if (!text) return { status: 'empty' };
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) {
    return { status: 'invalid', message: 'Enter a numeric value using a decimal point, such as 12.5 or -40.' };
  }
  const value = Number(text);
  return Number.isFinite(value)
    ? { status: 'valid', value }
    : { status: 'invalid', message: 'Enter a finite number; infinity and overflowing values are not supported.' };
}

function normalize(category: CategoryId, source: UnitId, value: number): number {
  if (!Number.isFinite(value)) throw new Error('The input must be a finite number.');
  const unit = getUnit(category, source);
  const base = value * unit.scale + unit.offset;
  if (!Number.isFinite(base)) throw new Error('This value is too large to convert safely.');
  return base;
}

function derive(base: number, unit: UnitDefinition): number {
  const value = (base - unit.offset) / unit.scale;
  if (!Number.isFinite(value)) throw new Error('This value is too large to convert safely.');
  return value;
}

export function convertUnit(category: CategoryId, source: UnitId, target: UnitId, value: number): number {
  const targetUnit = getUnit(category, target);
  if (source === target) throw new Error('Choose a different target unit.');
  return derive(normalize(category, source, value), targetUnit);
}

export function convertTargets(category: CategoryId, source: UnitId, value: number): readonly ConversionResult[] {
  const base = normalize(category, source, value);
  return getCategory(category).units.filter((unit) => unit.id !== source)
    .map((unit) => ({ unit, value: derive(base, unit) }));
}
