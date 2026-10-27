export type CategoryId = 'length' | 'mass' | 'temperature';
export type UnitId = 'cm' | 'ft' | 'in' | 'kg' | 'lb' | 'c' | 'f';

export interface UnitDefinition {
  readonly id: UnitId;
  readonly label: string;
  readonly symbol: string;
  /** base = value * scale + offset; inverse = (base - offset) / scale */
  readonly scale: number;
  readonly offset: number;
}
export interface CategoryDefinition {
  readonly id: CategoryId;
  readonly label: string;
  readonly help: string;
  readonly units: readonly UnitDefinition[];
}

export const CATEGORIES: readonly CategoryDefinition[] = [
  {
    id: 'length', label: 'Length', help: '1 foot = 30.48 centimeters; 1 inch = 2.54 centimeters. Feet are decimal values.',
    units: [
      { id: 'cm', label: 'Centimeters', symbol: 'cm', scale: 1, offset: 0 },
      { id: 'ft', label: 'Feet', symbol: 'ft', scale: 30.48, offset: 0 },
      { id: 'in', label: 'Inches', symbol: 'in', scale: 2.54, offset: 0 },
    ],
  },
  {
    id: 'mass', label: 'Mass', help: '1 pound = 0.45359237 kilograms.',
    units: [
      { id: 'kg', label: 'Kilograms', symbol: 'kg', scale: 1, offset: 0 },
      { id: 'lb', label: 'Pounds', symbol: 'lb', scale: 0.45359237, offset: 0 },
    ],
  },
  {
    id: 'temperature', label: 'Temperature', help: 'Fahrenheit = Celsius × 9/5 + 32. Temperature conversion includes an offset.',
    units: [
      { id: 'c', label: 'Celsius', symbol: '°C', scale: 1, offset: 0 },
      { id: 'f', label: 'Fahrenheit', symbol: '°F', scale: 5 / 9, offset: -160 / 9 },
    ],
  },
];

// Freeze shared configuration so views and calculations cannot alter its formulas.
for (const category of CATEGORIES) {
  for (const unit of category.units) Object.freeze(unit);
  Object.freeze(category.units);
  Object.freeze(category);
}
Object.freeze(CATEGORIES);

export function getCategory(id: string): CategoryDefinition {
  const category = CATEGORIES.find((entry) => entry.id === id);
  if (!category) throw new Error('Choose a supported category.');
  return category;
}

export function getUnit(categoryId: CategoryId, unitId: string): UnitDefinition {
  const unit = getCategory(categoryId).units.find((entry) => entry.id === unitId);
  if (!unit) throw new Error('The unit does not belong to the selected category.');
  return unit;
}
