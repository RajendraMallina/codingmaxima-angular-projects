export type Priority = 'High' | 'Medium' | 'Low';
export interface Task { id: string; title: string; priority: Priority; due: string; done: boolean }
export type EntryType = 'Income' | 'Expense';
export interface Transaction { id: string; type: EntryType; amount: number; category: string; date: string; note: string }
export interface Product { id: string; name: string; price: number; stock: number }
export interface Order { id: string; productId: string; productName: string; unitPrice: number; quantity: number; date: string; status: 'Active' | 'Cancelled' }
export interface Inventory { products: Product[]; orders: Order[] }
export const keys = { tasks: 'codingmaxima.tasks.v1', finance: 'codingmaxima.finance.v1', inventory: 'codingmaxima.inventory.v1' };
export const categories: Record<EntryType, readonly string[]> = { Income: ['Salary', 'Freelance', 'Gift', 'Other'], Expense: ['Food', 'Transport', 'Housing', 'Education', 'Shopping', 'Other'] };
export function day(offset = 0): string { const date = new Date(); date.setDate(date.getDate() + offset); const pad = (n: number) => String(n).padStart(2, '0'); return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); }
export const makeId = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
export const money = (paise: number) => '₹' + (paise / 100).toFixed(2);
export function toPaise(value: unknown, allowZero = false): number | null { const n = Number(value); if (!Number.isFinite(n) || n < (allowZero ? 0 : 0.01) || n > 1000000 || Math.abs(n * 100 - Math.round(n * 100)) > 1e-7) return null; return Math.round(n * 100); }
export const seedTasks = (): Task[] => [
  { id: 'sample-task-1', title: 'Plan the week', priority: 'High', due: day(1), done: false },
  { id: 'sample-task-2', title: 'Practice form events', priority: 'Medium', due: day(3), done: false },
  { id: 'sample-task-3', title: 'Review project ideas', priority: 'Low', due: day(-1), done: true },
];
export const seedTransactions = (): Transaction[] => [
  { id: 'sample-tx-1', type: 'Income', amount: 4500000, category: 'Salary', date: day(-12), note: 'Monthly salary' },
  { id: 'sample-tx-2', type: 'Income', amount: 500000, category: 'Freelance', date: day(-8), note: 'Design project' },
  { id: 'sample-tx-3', type: 'Expense', amount: 1200000, category: 'Housing', date: day(-10), note: 'Rent' },
  { id: 'sample-tx-4', type: 'Expense', amount: 235000, category: 'Food', date: day(-5), note: 'Groceries' },
  { id: 'sample-tx-5', type: 'Expense', amount: 85000, category: 'Transport', date: day(-3), note: 'Travel' },
  { id: 'sample-tx-6', type: 'Expense', amount: 160000, category: 'Education', date: day(-1), note: 'Online course' },
];
export const seedInventory = (): Inventory => ({ products: [
  { id: 'sample-product-1', name: 'Notebook', price: 12000, stock: 18 },
  { id: 'sample-product-2', name: 'Wireless mouse', price: 85000, stock: 7 },
  { id: 'sample-product-3', name: 'Desk lamp', price: 125000, stock: 4 },
  { id: 'sample-product-4', name: 'Pen set', price: 9000, stock: 25 },
], orders: [
  { id: 'sample-order-1', productId: 'sample-product-1', productName: 'Notebook', unitPrice: 12000, quantity: 2, date: day(-2), status: 'Active' },
  { id: 'sample-order-2', productId: 'sample-product-2', productName: 'Wireless mouse', unitPrice: 85000, quantity: 1, date: day(-1), status: 'Active' },
] });
const rec = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export const isTask = (v: unknown): v is Task => rec(v) && typeof v['id'] === 'string' && typeof v['title'] === 'string' && ['High', 'Medium', 'Low'].includes(String(v['priority'])) && typeof v['due'] === 'string' && typeof v['done'] === 'boolean';
export const isTransaction = (v: unknown): v is Transaction => rec(v) && typeof v['id'] === 'string' && (v['type'] === 'Income' || v['type'] === 'Expense') && Number.isSafeInteger(v['amount']) && Number(v['amount']) > 0 && typeof v['category'] === 'string' && typeof v['date'] === 'string' && typeof v['note'] === 'string';
const isProduct = (v: unknown): v is Product => rec(v) && typeof v['id'] === 'string' && typeof v['name'] === 'string' && Number.isSafeInteger(v['price']) && Number(v['price']) >= 0 && Number.isSafeInteger(v['stock']) && Number(v['stock']) >= 0;
const isOrder = (v: unknown): v is Order => rec(v) && typeof v['id'] === 'string' && typeof v['productId'] === 'string' && typeof v['productName'] === 'string' && Number.isSafeInteger(v['unitPrice']) && Number(v['unitPrice']) >= 0 && Number.isSafeInteger(v['quantity']) && Number(v['quantity']) > 0 && typeof v['date'] === 'string' && (v['status'] === 'Active' || v['status'] === 'Cancelled');
export const isInventory = (v: unknown): v is Inventory => { if (!rec(v)) return false; const products = v['products'], orders = v['orders']; return Array.isArray(products) && products.every(isProduct) && Array.isArray(orders) && orders.every(isOrder) && orders.every((o: Order) => o.status === 'Cancelled' || products.some((p: Product) => p.id === o.productId)); };
export const isArrayOf = <T>(value: unknown, check: (v: unknown) => v is T): value is T[] => Array.isArray(value) && value.every(check);
export function readStored<T>(key: string, example: () => T, valid: (v: unknown) => v is T): { data: T; message: string } {
  try { const raw = localStorage.getItem(key); if (raw === null) { const data = example(); localStorage.setItem(key, JSON.stringify(data)); return { data, message: 'Sample data is ready. Your changes are saved in this browser.' }; } const data: unknown = JSON.parse(raw); if (!valid(data)) return { data: example(), message: 'Saved data could not be read. Sample data is shown until you make a change.' }; return { data, message: 'Your data is saved in this browser.' }; }
  catch { return { data: example(), message: 'Browser storage is unavailable. Changes may be lost on refresh.' }; }
}
export function writeStored<T>(key: string, data: T): boolean { try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch { return false; } }
