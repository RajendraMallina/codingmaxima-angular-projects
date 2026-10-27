import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PROJECT_SEO } from './seo-metadata';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.updateMetadata();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.updateMetadata());
  }

  private updateMetadata(): void {
    const route = this.router.url.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
    const page = PROJECT_SEO.find((entry) => entry.route === route) ?? PROJECT_SEO[0];
    const title = `${page.name} | CodingMaxima Angular Projects`;
    const description = page.summary;
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: page.keywords });
    this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large' });
    this.meta.updateTag({ name: 'author', content: 'CodingMaxima' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'CodingMaxima Angular Projects' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: 'https://codingmaxima.com/assets/img/nlogo.png' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: 'https://codingmaxima.com/assets/img/nlogo.png' });

    const oldSchema = this.document.getElementById('codingmaxima-project-schema');
    oldSchema?.remove();
    const schema = this.document.createElement('script');
    schema.id = 'codingmaxima-project-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': route ? 'WebApplication' : 'CollectionPage',
      name: page.name,
      description: page.detail,
      applicationCategory: page.category,
      operatingSystem: 'Any',
      inLanguage: 'en',
      author: { '@type': 'Organization', name: 'CodingMaxima', url: 'https://codingmaxima.com/' },
      isPartOf: { '@type': 'CreativeWorkSeries', name: 'CodingMaxima Angular Projects' },
    });
    this.document.head.appendChild(schema);
  }
}
