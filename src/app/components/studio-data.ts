import type { ReadingItem, ReadingStatus, ReadingType } from './reading-catalog';

export interface BlogPost { id: string; slug: string; title: string; category: string; tags: string[]; content: string; status: 'Published' | 'Draft'; created: string }
export type FieldType = 'text' | 'dropdown' | 'radio' | 'checkbox';
export interface FormField { id: string; label: string; type: FieldType; options: string[]; required: boolean }
export interface SavedForm { id: string; title: string; fields: FormField[] }
export interface Answer { label: string; value: string }
export interface FormResponse { id: string; formId: string; date: string; answers: Answer[] }
export interface BuilderData { forms: SavedForm[]; responses: FormResponse[] }
export const studioKeys = { blog: 'codingmaxima.blog-studio.v1', builder: 'codingmaxima.form-builder.v1', reading: 'codingmaxima.reading-library.v1' };
export const types: ReadingType[] = ['Book', 'Research paper', 'Article'];
export const statuses: ReadingStatus[] = ['Want to read', 'Reading', 'Completed'];
export function safeUrl(value: string): boolean { if (!value.trim()) return true; try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; } }
export function slugFor(title: string, existing: readonly BlogPost[]): string { const base = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'post'; let slug = base, n = 2; while (existing.some((post) => post.slug === slug)) slug = base + '-' + n++; return slug; }
export function seedBlog(): BlogPost[] { return [
  { id: 'blog-1', slug: 'small-projects-big-learning', title: 'Small Projects, Big Learning', category: 'Learning', tags: ['Practice', 'Beginners'], content: 'A small project gives you a clear place to try one new idea. Start with a simple goal, make it work, and then improve one detail at a time.\n\nKeep a note of what surprised you. Those observations often become your next project.', status: 'Published', created: '2026-01-15' },
  { id: 'blog-2', slug: 'building-better-forms', title: 'Building Better Forms', category: 'Web development', tags: ['Forms', 'Accessibility'], content: 'A helpful form makes the next step clear. Start with meaningful labels and group related questions together.\n\nShow feedback close to the field, preserve what the user has entered, and make sure the page works with a keyboard.', status: 'Published', created: '2026-02-10' },
  { id: 'blog-3', slug: 'what-a-table-can-teach', title: 'What a Table Can Teach', category: 'Practice', tags: ['JavaScript', 'Data'], content: 'A table is a useful way to explore how data and a page stay in sync. Try adding a row, editing one value, and updating a summary.\n\nFiltering and sorting can then show different views of the same information.', status: 'Published', created: '2026-03-05' },
  { id: 'blog-4', slug: 'my-next-project-draft', title: 'My Next Project', category: 'Ideas', tags: ['Draft'], content: 'Write down the problem, the smallest useful version, and one feature to add later.', status: 'Draft', created: '2026-03-18' },
]; }
export function seedBuilder(): BuilderData { return { forms: [{ id: 'sample-feedback', title: 'Workshop feedback', fields: [
  { id: 'f-name', label: 'Your name', type: 'text', options: [], required: true },
  { id: 'f-experience', label: 'How was the workshop?', type: 'dropdown', options: ['Excellent', 'Good', 'Needs improvement'], required: true },
  { id: 'f-return', label: 'Would you attend again?', type: 'radio', options: ['Yes', 'Maybe', 'No'], required: true },
  { id: 'f-topics', label: 'Topics you enjoyed', type: 'checkbox', options: ['Forms', 'Tables', 'Projects'], required: false },
] }], responses: [{ id: 'sample-response', formId: 'sample-feedback', date: '2026-01-15', answers: [{ label: 'Your name', value: 'Alex' }, { label: 'How was the workshop?', value: 'Excellent' }, { label: 'Would you attend again?', value: 'Yes' }, { label: 'Topics you enjoyed', value: 'Forms, Projects' }] }] }; }
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
export const isBlogPost = (v: unknown): v is BlogPost => record(v) && typeof v['id'] === 'string' && typeof v['slug'] === 'string' && typeof v['title'] === 'string' && typeof v['category'] === 'string' && Array.isArray(v['tags']) && v['tags'].every((t: unknown) => typeof t === 'string') && typeof v['content'] === 'string' && (v['status'] === 'Published' || v['status'] === 'Draft') && typeof v['created'] === 'string';
const isField = (v: unknown): v is FormField => record(v) && typeof v['id'] === 'string' && typeof v['label'] === 'string' && ['text', 'dropdown', 'radio', 'checkbox'].includes(String(v['type'])) && Array.isArray(v['options']) && v['options'].every((o: unknown) => typeof o === 'string') && typeof v['required'] === 'boolean';
const isForm = (v: unknown): v is SavedForm => record(v) && typeof v['id'] === 'string' && typeof v['title'] === 'string' && Array.isArray(v['fields']) && v['fields'].every(isField);
const isAnswer = (v: unknown): v is Answer => record(v) && typeof v['label'] === 'string' && typeof v['value'] === 'string';
const isResponse = (v: unknown): v is FormResponse => record(v) && typeof v['id'] === 'string' && typeof v['formId'] === 'string' && typeof v['date'] === 'string' && Array.isArray(v['answers']) && v['answers'].every(isAnswer);
export const isBuilder = (v: unknown): v is BuilderData => record(v) && Array.isArray(v['forms']) && v['forms'].every(isForm) && Array.isArray(v['responses']) && v['responses'].every(isResponse);
export const isReading = (v: unknown): v is ReadingItem => record(v) && typeof v['id'] === 'string' && typeof v['title'] === 'string' && typeof v['author'] === 'string' && types.includes(v['type'] as ReadingType) && typeof v['subject'] === 'string' && typeof v['url'] === 'string' && safeUrl(v['url']) && typeof v['source'] === 'string' && statuses.includes(v['status'] as ReadingStatus) && typeof v['progress'] === 'number' && Number.isFinite(v['progress']) && v['progress'] >= 0 && v['progress'] <= 100 && typeof v['notes'] === 'string';
