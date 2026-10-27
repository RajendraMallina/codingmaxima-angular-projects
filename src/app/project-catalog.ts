export interface PracticeProject {
  readonly path: string;
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly icon: string;
}

/** The single source of truth for the practice-lab navigation and gallery. */
export const PRACTICE_PROJECTS: readonly PracticeProject[] = [
  { path: 'kilograms-pounds', title: 'Kilograms & Pounds', category: 'Weight', description: 'Convert between metric and imperial weight with live results.', icon: 'kg' },
  { path: 'centimeter-feets', title: 'Centimeters & Feet', category: 'Length', description: 'Explore a quick, precise conversion between centimeters and feet.', icon: 'cm' },
  { path: 'centimeter-feets-inches', title: 'Feet & Inches', category: 'Length', description: 'Translate a measurement into the familiar feet-and-inches format.', icon: 'ft' },
  { path: 'multi-category-unit', title: 'Unit Converter', category: 'Everyday utility', description: 'Convert values across several useful categories and units.', icon: '↗' },
  { path: 'digital-clock', title: 'Digital Clock', category: 'Time', description: 'A clear, live clock with a choice of 12 or 24-hour time.', icon: '◷' },
  { path: 'stop-watch', title: 'Stopwatch', category: 'Time', description: 'Start, pause, and resume a precise elapsed-time measurement.', icon: '◴' },
  { path: 'guess-number', title: 'Number Guessing Game', category: 'Play & learn', description: 'Read the clues, sharpen your intuition, and beat your high score.', icon: '?' },
  { path: 'random-quote-collection', title: 'Quote Collection', category: 'Inspiration', description: 'Discover a fresh collection of thoughtful words.', icon: '“' },
];

export function projectForPath(path: string | undefined): PracticeProject | undefined {
  return PRACTICE_PROJECTS.find((project) => project.path === path);
}
