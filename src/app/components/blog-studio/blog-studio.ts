import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogPost, isBlogPost, seedBlog, slugFor, studioKeys } from '../studio-data';
import { day, isArrayOf, makeId, readStored, writeStored } from '../workflow-data';

@Component({ selector: 'app-blog-studio', imports: [FormsModule, RouterLink], styleUrls: ['../practice-labs.css', '../workflows.css', '../studio.css'], templateUrl: './blog-studio.html' })
export class BlogStudio {
  private readonly route = inject(ActivatedRoute); private readonly router = inject(Router);
  protected readonly view = this.route.snapshot.data['view'] as 'home' | 'manage' | 'editor' | 'post';
  protected currentSlug = this.route.snapshot.queryParamMap.get('slug') ?? '';
  protected readonly posts = signal<BlogPost[]>([]); protected readonly status = signal('Loading your blog…'); protected readonly error = signal(''); protected readonly search = signal(''); protected readonly categoryFilter = signal('All'); protected readonly sort = signal('newest');
  protected title = ''; protected category = ''; protected tags = ''; protected content = ''; protected postStatus: BlogPost['status'] = 'Draft';
  protected readonly categories = computed(() => [...new Set(this.posts().filter((post) => post.status === 'Published').map((post) => post.category))].sort());
  protected readonly published = computed(() => { const q = this.search().trim().toLowerCase(); return this.posts().filter((p) => p.status === 'Published' && (this.categoryFilter() === 'All' || p.category === this.categoryFilter()) && [p.title, p.category, p.content, ...p.tags].some((v) => v.toLowerCase().includes(q))).slice().sort((a, b) => this.sort() === 'title' ? a.title.localeCompare(b.title) : b.created.localeCompare(a.created)); });
  protected readonly selected = computed(() => this.posts().find((post) => post.slug === this.currentSlug && post.status === 'Published'));
  constructor() { afterNextRender(() => { const saved = readStored(studioKeys.blog, seedBlog, (v): v is BlogPost[] => isArrayOf(v, isBlogPost)); this.posts.set(saved.data); this.status.set(saved.message); const post = this.view === 'editor' ? saved.data.find((item) => item.slug === this.currentSlug) : undefined; if (post) { this.title = post.title; this.category = post.category; this.tags = post.tags.join(', '); this.content = post.content; this.postStatus = post.status; } else if (this.view === 'editor' && this.currentSlug) this.error.set('This post could not be found.'); }); }
  private commit(posts: BlogPost[], message: string): void { this.posts.set(posts); this.status.set(writeStored(studioKeys.blog, posts) ? message : message + ' Browser storage is unavailable; changes may be lost on refresh.'); }
  protected save(form: NgForm): void { const title = this.title.trim(), category = this.category.trim(), content = this.content.trim(); if (form.invalid || !title || !category || !content) { this.error.set('Enter a title, category, and post content.'); return; } const previous = this.posts().find((post) => post.slug === this.currentSlug); if (this.currentSlug && !previous) { this.error.set('This post no longer exists.'); return; } const post: BlogPost = { id: previous?.id ?? makeId(), slug: previous?.slug ?? slugFor(title, this.posts()), title, category, tags: [...new Set(this.tags.split(',').map((tag) => tag.trim()).filter(Boolean))].slice(0, 8), content, status: this.postStatus, created: previous?.created ?? day() }; this.commit(previous ? this.posts().map((p) => p.id === previous.id ? post : p) : [post, ...this.posts()], previous ? 'Post updated.' : 'Post saved.'); this.currentSlug = post.slug; this.error.set(''); if (!previous) void this.router.navigate(['/blog-studio/editor'], { queryParams: { slug: post.slug }, replaceUrl: true }); }
  protected toggle(post: BlogPost): void { this.commit(this.posts().map((p) => p.id === post.id ? { ...p, status: p.status === 'Published' ? 'Draft' : 'Published' } : p), post.status === 'Published' ? 'Post moved to drafts.' : 'Post published to your local blog.'); }
  protected remove(post: BlogPost): void { if (!confirm('Delete “' + post.title + '”?')) return; this.commit(this.posts().filter((p) => p.id !== post.id), 'Post deleted.'); }
}
