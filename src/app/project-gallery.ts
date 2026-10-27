import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRACTICE_PROJECTS } from './project-catalog';

@Component({
  selector: 'app-project-gallery',
  imports: [RouterLink],
  template: `
    <header class="cm-project-header">
      <a class="cm-skip-link" href="#project-content">Skip to projects</a>
      <a class="cm-project-brand" href="https://codingmaxima.com/" aria-label="CodingMaxima website"><span class="cm-logo" role="img" aria-label="CodingMaxima"></span></a>
      <span class="cm-project-divider" aria-hidden="true"></span>
      <div class="cm-project-meta"><span>INTERACTIVE PRACTICE LAB</span><strong>Project Gallery</strong></div>
    </header>
    <main id="project-content" class="gallery" aria-labelledby="gallery-title">
      <section class="intro">
        <p class="eyebrow"><span class="live-dot" aria-hidden="true"></span> YOUR CREATIVE SPACE TO PRACTICE</p>
        <h1 id="gallery-title">Small ideas.<br /><span>Stronger coding skills.</span></h1>
        <p class="intro-copy">A hands-on collection of little tools and challenges. Choose a project, play around, and learn by doing.</p>
        <div class="gallery-meta"><span><span aria-hidden="true">✳</span> 8 interactive projects</span><span aria-hidden="true" class="meta-divider">·</span><span>Made to explore</span></div>
      </section>
      <section class="project-grid" aria-label="Browse all practice projects">
        @for (project of projects; track project.path; let i = $index) {
          <a class="project-card" [routerLink]="['/', project.path]" [style.--card-delay]="i * 45 + 'ms'">
            <div class="card-top"><span class="project-icon" aria-hidden="true">{{ project.icon }}</span><span class="card-category">{{ project.category }}</span><span class="card-arrow" aria-hidden="true">↗</span></div>
            <h2>{{ project.title }}</h2>
            <p>{{ project.description }}</p>
            <span class="card-action">Open project <span aria-hidden="true">→</span></span>
          </a>
        }
      </section>
    </main>
    <footer class="cm-project-footer"><span><strong>CodingMaxima</strong> · Learn visually. Think logically. Code confidently.</span><span class="cm-footer-label">8 INDEPENDENT PROJECTS</span></footer>
  `,
  styles: `
    :host{display:block}.gallery{width:min(calc(100% - 3rem),1120px);margin:0 auto;padding:clamp(38px,6vw,76px) 0 72px}
    .intro{max-width:720px;margin-bottom:40px}.eyebrow{display:flex;align-items:center;gap:10px;color:#6660c8;font-size:.7rem;font-weight:800;letter-spacing:.12em}.live-dot{width:8px;height:8px;border-radius:50%;background:#35b994;box-shadow:0 0 0 4px #e3f6f0}.intro h1{margin:22px 0 14px;font-size:clamp(2.5rem,6vw,4.65rem);line-height:1.09;font-weight:750;color:#20243a}.intro h1 span{color:#6861ce}.intro-copy{max-width:590px;margin-bottom:22px;color:#687087;font-size:clamp(1rem,2vw,1.13rem);line-height:1.75}.gallery-meta{display:flex;align-items:center;gap:13px;color:#777e92;font-size:.82rem;font-weight:600}.gallery-meta>span:first-child{color:#505970}.gallery-meta>span:first-child span{color:#7972d6}.meta-divider{color:#c7cad5}
    .project-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px}.project-card{position:relative;display:flex;min-height:222px;flex-direction:column;padding:22px 21px 19px;border:1px solid #e9eaf2;border-radius:22px;background:rgba(255,255,255,.86);color:inherit;text-decoration:none;box-shadow:0 4px 18px rgba(32,36,58,.025);transition:transform .2s,border-color .2s,box-shadow .2s;animation:card-in .38s both;animation-delay:var(--card-delay,0ms)}.project-card:hover{transform:translateY(-4px);border-color:#d6d3fb;box-shadow:0 14px 32px rgba(47,42,112,.09)}.project-card:focus-visible{outline:3px solid #aaa5ff;outline-offset:3px}.card-top{display:flex;align-items:center;gap:11px;margin-bottom:19px}.project-icon{display:grid;width:42px;height:42px;place-items:center;border:1px solid #eeedff;border-radius:14px;background:#f4f3ff;color:#5149d8;font-family:'Manrope',sans-serif;font-size:1.13rem;font-weight:800}.card-category{padding:5px 9px;border-radius:100px;background:#f4f5f9;color:#737a8d;font-size:.67rem;font-weight:700}.card-arrow{margin-left:auto;color:#a8adbb;font-size:1.12rem;transition:color .15s,transform .15s}.project-card:hover .card-arrow{transform:translate(2px,-2px);color:#5149d8}.project-card h2{margin-bottom:8px;font-size:1.08rem;line-height:1.35;font-weight:750;letter-spacing:-.025em}.project-card p{margin-bottom:16px;color:#777e91;font-size:.83rem;line-height:1.6}.card-action{display:flex;justify-content:space-between;align-items:center;margin-top:auto;color:#5048c8;font-size:.8rem;font-weight:750}.card-action span{font-size:1.03rem;transition:transform .15s}.project-card:hover .card-action span{transform:translateX(3px)}
    @keyframes card-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @media(max-width:820px){.project-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.gallery{width:min(calc(100% - 2.5rem),700px)}}@media(max-width:520px){.gallery{width:calc(100% - 2rem);padding:34px 0 48px}.intro{margin-bottom:27px}.intro h1{margin-top:17px}.project-grid{grid-template-columns:1fr;gap:12px}.project-card{min-height:192px;padding:18px}.card-top{margin-bottom:14px}}
    @media(prefers-reduced-motion:reduce){.project-card{animation:none}}
  `,
})
export class ProjectGallery {
  protected readonly projects = PRACTICE_PROJECTS;
}
