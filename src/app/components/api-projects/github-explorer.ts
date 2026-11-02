import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface Profile {
  login: string;
  name?: string;
  bio?: string;
  avatar_url?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  location?: string;
}
interface Repo {
  name: string;
  description?: string;
  language?: string;
  stargazers_count?: number;
  forks_count?: number;
  updated_at?: string;
  default_branch?: string;
  open_issues_count?: number;
}
@Component({
  selector: 'app-github-explorer',
  imports: [FormsModule],
  styleUrls: ['../practice-labs.css', './api-projects.css'],
  templateUrl: './github-explorer.html',
})
export class GithubExplorer {
  protected username = '';
  protected repoSearch = '';
  protected sort = 'updated';
  protected readonly profile = signal<Profile | null>(null);
  protected readonly repos = signal<Repo[]>([]);
  protected readonly detail = signal<Repo | null>(null);
  protected readonly page = signal(1);
  protected readonly total = signal(0);
  protected readonly status = signal('Search for a public GitHub profile.');
  protected readonly repoStatus = signal('');
  private request = 0;
  private repoRequest = 0;
  private activeSearch = '';
  private async json(url: string): Promise<unknown> {
    const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (response.status === 404)
      throw Error('No profile or repository found. Check the name and try again.');
    if (response.status === 403 || response.status === 429)
      throw Error('GitHub request limit reached or access restricted. Please try again later.');
    if (!response.ok) throw Error('GitHub is temporarily unavailable. Please try again.');
    return response.json();
  }
  protected async searchProfile(): Promise<void> {
    const name = this.username.trim();
    if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(name)) {
      this.status.set('Enter a valid GitHub username.');
      return;
    }
    const id = ++this.request;
    this.repoRequest++;
    this.profile.set(null);
    this.repos.set([]);
    this.detail.set(null);
    this.repoStatus.set('');
    this.status.set('Loading profile…');
    try {
      const data = (await this.json(
        'https://api.github.com/users/' + encodeURIComponent(name),
      )) as Profile;
      if (id !== this.request) return;
      if (!data || typeof data.login !== 'string') throw Error('Profile data is unavailable.');
      this.profile.set(data);
      this.status.set('Profile loaded.');
      this.repoSearch = '';
      this.activeSearch = '';
      void this.loadRepos(1);
    } catch (error) {
      if (id === this.request)
        this.status.set(error instanceof Error ? error.message : 'Could not connect to GitHub.');
    }
  }
  protected searchRepos(): void {
    this.activeSearch = this.repoSearch.trim();
    void this.loadRepos(1);
  }
  protected async loadRepos(page: number): Promise<void> {
    const profile = this.profile();
    if (!profile) return;
    const id = ++this.repoRequest;
    this.page.set(page);
    this.detail.set(null);
    this.repos.set([]);
    this.repoStatus.set('Loading repositories…');
    try {
      const per = '10';
      let url: string;
      if (this.activeSearch) {
        const q = new URLSearchParams({
          q: `user:${profile.login} ${this.activeSearch} in:name`,
          per_page: per,
          page: String(page),
          sort: 'updated',
          order: 'desc',
        });
        url = 'https://api.github.com/search/repositories?' + q;
      } else {
        url =
          'https://api.github.com/users/' +
          encodeURIComponent(profile.login) +
          '/repos?' +
          new URLSearchParams({
            per_page: per,
            page: String(page),
            sort: 'updated',
            direction: 'desc',
          });
      }
      const data = (await this.json(url)) as Repo[] | { items?: Repo[]; total_count?: number };
      if (id !== this.repoRequest) return;
      const rows = Array.isArray(data) ? data : data.items || [];
      this.repos.set(rows.filter((row) => row && typeof row.name === 'string'));
      this.total.set(Array.isArray(data) ? profile.public_repos || 0 : data.total_count || 0);
      this.repoStatus.set(
        rows.length ? 'Choose a repository for details.' : 'No repositories found.',
      );
    } catch (error) {
      if (id === this.repoRequest) {
        this.total.set(0);
        this.repoStatus.set(
          error instanceof Error ? error.message : 'Could not load repositories.',
        );
      }
    }
  }
  protected sorted(): Repo[] {
    return this.sort === 'name'
      ? [...this.repos()].sort((a, b) => a.name.localeCompare(b.name))
      : this.repos();
  }
  protected async show(repo: Repo): Promise<void> {
    const profile = this.profile();
    if (!profile) return;
    const id = ++this.repoRequest;
    this.detail.set(null);
    this.repoStatus.set('Loading repository details…');
    try {
      const data = (await this.json(
        'https://api.github.com/repos/' +
          encodeURIComponent(profile.login) +
          '/' +
          encodeURIComponent(repo.name),
      )) as Repo;
      if (id !== this.repoRequest) return;
      this.detail.set(data);
      this.repoStatus.set('Repository details loaded.');
    } catch (error) {
      if (id === this.repoRequest)
        this.repoStatus.set(
          error instanceof Error ? error.message : 'Could not load repository details.',
        );
    }
  }
  protected avatar(profile: Profile): string {
    try {
      const url = new URL(profile.avatar_url || '');
      return url.protocol === 'https:' && url.hostname === 'avatars.githubusercontent.com'
        ? url.href
        : '';
    } catch {
      return '';
    }
  }
  protected profileUrl(): string {
    return 'https://github.com/' + encodeURIComponent(this.profile()?.login || '');
  }
  protected repoUrl(repo: Repo): string {
    return this.profileUrl() + '/' + encodeURIComponent(repo.name);
  }
}
