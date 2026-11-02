import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReadingItem, seedReading } from '../reading-catalog';
import { isReading, studioKeys } from '../studio-data';
interface Book {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}
interface SearchResult {
  numFound: number;
  docs: Book[];
}
@Component({
  selector: 'app-book-discovery',
  imports: [FormsModule],
  styleUrls: ['../practice-labs.css', './api-projects.css'],
  templateUrl: './book-discovery.html',
})
export class BookDiscovery {
  protected readonly Math = Math;
  protected query = '';
  protected type = 'title';
  protected readonly books = signal<Book[]>([]);
  protected readonly status = signal('Search for a title or author to begin.');
  protected readonly page = signal(1);
  protected readonly total = signal(0);
  protected readonly shelfStatus = signal('');
  private request = 0;
  private activeQuery = '';
  private activeType = 'title';
  private readonly cache = new Map<string, SearchResult>();
  protected search(): void {
    const query = this.query.trim();
    if (!query) {
      this.status.set('Enter a title or author.');
      return;
    }
    this.activeQuery = query;
    this.activeType = this.type;
    void this.load(1);
  }
  protected async load(page: number): Promise<void> {
    const id = ++this.request;
    this.books.set([]);
    this.status.set('Searching Open Library…');
    this.page.set(page);
    const params = new URLSearchParams({
      [this.activeType]: this.activeQuery,
      page: String(page),
      limit: '10',
      fields: 'key,title,author_name,first_publish_year,cover_i',
    });
    const cacheKey = params.toString();
    try {
      let data = this.cache.get(cacheKey);
      if (!data) {
        const response = await fetch('https://openlibrary.org/search.json?' + params);
        if (!response.ok) throw Error();
        data = (await response.json()) as SearchResult;
        if (!Array.isArray(data.docs) || typeof data.numFound !== 'number') throw Error();
        this.cache.set(cacheKey, data);
      }
      if (id !== this.request) return;
      this.books.set(
        data.docs.filter(
          (book) => book && typeof book.title === 'string' && typeof book.key === 'string',
        ),
      );
      this.total.set(data.numFound);
      this.status.set(
        data.numFound
          ? `${data.numFound.toLocaleString()} results found.`
          : 'No books found. Try another search.',
      );
    } catch {
      if (id === this.request) {
        this.total.set(0);
        this.status.set('Could not load books. Check your connection and try again.');
      }
    }
  }
  protected cover(book: Book): string {
    return typeof book.cover_i === 'number' &&
      Number.isSafeInteger(book.cover_i) &&
      book.cover_i > 0
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : '';
  }
  protected url(book: Book): string {
    return /^\/works\/OL\d+W$/.test(book.key) ? 'https://openlibrary.org' + book.key : '';
  }
  protected author(book: Book): string {
    return (
      book.author_name?.filter((name) => typeof name === 'string').join(', ') || 'Unknown author'
    );
  }
  protected add(book: Book): void {
    const url = this.url(book);
    if (!url) {
      this.shelfStatus.set(
        'This result cannot be saved because its Open Library link is unavailable.',
      );
      return;
    }
    try {
      const raw = localStorage.getItem(studioKeys.reading);
      const saved: unknown = raw === null ? seedReading() : JSON.parse(raw);
      if (!Array.isArray(saved) || !saved.every(isReading)) {
        this.shelfStatus.set('Your reading library could not be read, so it was not changed.');
        return;
      }
      const id = 'openlibrary-' + book.key.split('/').pop();
      if (saved.some((item) => item.id === id || item.url === url)) {
        this.shelfStatus.set('This book is already in your reading library.');
        return;
      }
      const item: ReadingItem = {
        id,
        title: book.title.slice(0, 180),
        author: this.author(book).slice(0, 120),
        type: 'Book',
        subject: 'Books',
        url,
        source: 'Open Library',
        status: 'Want to read',
        progress: 0,
        notes: '',
      };
      localStorage.setItem(studioKeys.reading, JSON.stringify([item, ...saved]));
      this.shelfStatus.set('Added to your reading library.');
    } catch {
      this.shelfStatus.set('Could not save your book. Check that browser storage is available.');
    }
  }
}
