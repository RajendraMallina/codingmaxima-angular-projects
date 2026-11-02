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
  { path: 'student-records', title: 'Student Records', category: 'Forms & tables', description: 'Add student details, select records, and manage a clear, responsive class list.', icon: '✓' },
  { path: 'grade-tracker', title: 'Student Marks & Grade Tracker', category: 'Forms & calculations', description: 'Edit subject marks and watch grades and class averages update.', icon: 'A+' },
  { path: 'invoice-generator', title: 'Shopping Cart & Invoice', category: 'Forms & calculations', description: 'Build an invoice with editable items, discounts and live totals.', icon: '₹' },
  { path: 'event-registration', title: 'Event Registration Manager', category: 'Connected forms', description: 'Create events, register participants and track available seats.', icon: '✳' },
  { path: 'task-planner', title: 'Task & Progress Planner', category: 'Editing & filters', description: 'Plan tasks, edit details and track progress with live filters.', icon: '✓' },
  { path: 'income-expense', title: 'Income & Expense Dashboard', category: 'Forms & summaries', description: 'Explore a sample budget and see totals and categories update.', icon: '₹' },
  { path: 'inventory-orders', title: 'Inventory & Order Manager', category: 'Multi-page workflows', description: 'Manage products and orders across a connected sample shop.', icon: '▦' },
  { path: 'blog-studio', title: 'Blog Studio', category: 'Multi-page publishing', description: 'Write, preview, and organize a local blog with sample posts.', icon: '✎' },
  { path: 'form-builder', title: 'Form Builder & Responses', category: 'Dynamic forms', description: 'Build forms, preview fields, and explore saved responses.', icon: '☷' },
  { path: 'reading-tracker', title: 'Personal Reading Tracker', category: 'Reading & discovery', description: 'Explore free books, research papers and articles, and track your reading.', icon: '▤' },
  { path: 'country-explorer', title: 'Country Explorer', category: 'Public APIs', description: 'Search countries and explore their flags, languages and details.', icon: '◎' },
  { path: 'github-profile-explorer', title: 'GitHub Profile Explorer', category: 'Public APIs', description: 'Explore public profiles and search their repositories.', icon: '⌘' },
  { path: 'weather-dashboard', title: 'Weather Dashboard', category: 'Public APIs', description: 'Search for a city and explore its current weather and forecast.', icon: '☀' },
  { path: 'currency-converter', title: 'Currency Converter', category: 'Public APIs', description: 'Convert currencies with the latest available or historical rates.', icon: '↔' },
  { path: 'book-discovery', title: 'Book Discovery', category: 'Public APIs', description: 'Search for books and save discoveries to your reading library.', icon: '▤' },
];

export function projectForPath(path: string | undefined): PracticeProject | undefined {
  return PRACTICE_PROJECTS.find((project) => project.path === path);
}
