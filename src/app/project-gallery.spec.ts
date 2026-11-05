import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProjectGallery } from './project-gallery';
import { PRACTICE_PROJECTS, PROJECT_SECTIONS } from './project-catalog';

describe('project gallery', () => {
  it('shows each catalog project exactly once in the intended sections', async () => {
    await TestBed.configureTestingModule({ imports: [ProjectGallery], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(ProjectGallery);
    fixture.detectChanges();

    const sections = Array.from(fixture.nativeElement.querySelectorAll('.project-section')) as HTMLElement[];
    expect(sections.map(section => section.querySelector('h2')?.textContent?.trim())).toEqual([
      'Basic', 'Intermediate', 'API / Backend Integration',
    ]);
    const paths = PROJECT_SECTIONS.flatMap(section => section.projects.map(project => project.path));
    expect(paths.length).toBe(PRACTICE_PROJECTS.length);
    expect(new Set(paths)).toEqual(new Set(PRACTICE_PROJECTS.map(project => project.path)));
    expect(sections.flatMap(section => Array.from(section.querySelectorAll('.project-card')).map(link => link.getAttribute('href'))))
      .toEqual(paths.map(path => '/' + path));
  });
});
