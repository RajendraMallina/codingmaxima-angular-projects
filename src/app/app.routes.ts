import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./project-gallery').then((m) => m.ProjectGallery) },
  {
    path: 'kilograms-pounds',
    loadComponent: () =>
      import('./components/kilograms-pounds/kilograms-pounds').then((m) => m.KilogramsPounds),
  },
  {
    path: 'centimeter-feets',
    loadComponent: () =>
      import('./components/centimeter-feets/centimeter-feets').then((m) => m.CentimeterFeets),
  },
  {
    path: 'centimeter-feets-inches',
    loadComponent: () =>
      import('./components/centimeter-feets-inches/centimeter-feets-inches').then((m) => m.CentimeterFeetsInches),
  },
  {
    path: 'random-quote-collection',
    loadComponent: () =>
      import('./components/random-quote-collection/random-quote-collection').then((m) => m.RandomQuoteCollection),
  },
  {
    path: 'digital-clock',
    loadComponent: () =>
      import('./components/digital-clock/digital-clock').then((m) => m.DigitalClock),
  },
  {
    path: 'guess-number',
    loadComponent: () =>
      import('./components/guess-number/guess-number').then((m) => m.GuessNumber),
  },
  {
    path: 'multi-category-unit',
    loadComponent: () =>
      import('./components/multi-category-unit/multi-category-unit').then((m) => m.MultiCategoryUnit),
  },
  {
    path: 'stop-watch',
    loadComponent: () =>
      import('./components/stop-watch/stop-watch').then((m) => m.StopWatch),
  },
];






