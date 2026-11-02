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
  {
    path: 'student-records',
    loadComponent: () =>
      import('./components/student-records/student-records').then((m) => m.StudentRecords),
  },
  { path: 'grade-tracker', loadComponent: () => import('./components/grade-tracker/grade-tracker').then((m) => m.GradeTracker) },
  { path: 'invoice-generator', loadComponent: () => import('./components/invoice-generator/invoice-generator').then((m) => m.InvoiceGenerator) },
  { path: 'event-registration', loadComponent: () => import('./components/event-registration/event-registration').then((m) => m.EventRegistration) },
  { path: 'task-planner', loadComponent: () => import('./components/task-planner/task-planner').then((m) => m.TaskPlanner) },
  { path: 'income-expense', loadComponent: () => import('./components/income-expense/income-expense').then((m) => m.IncomeExpense) },
  { path: 'inventory-orders', data: { view: 'dashboard' }, loadComponent: () => import('./components/inventory-orders/inventory-orders').then((m) => m.InventoryOrders) },
  { path: 'inventory-orders/products', data: { view: 'products' }, loadComponent: () => import('./components/inventory-orders/inventory-orders').then((m) => m.InventoryOrders) },
  { path: 'inventory-orders/orders', data: { view: 'orders' }, loadComponent: () => import('./components/inventory-orders/inventory-orders').then((m) => m.InventoryOrders) },
  { path: 'blog-studio', data: { view: 'home' }, loadComponent: () => import('./components/blog-studio/blog-studio').then((m) => m.BlogStudio) },
  { path: 'blog-studio/manage', data: { view: 'manage' }, loadComponent: () => import('./components/blog-studio/blog-studio').then((m) => m.BlogStudio) },
  { path: 'blog-studio/editor', data: { view: 'editor' }, loadComponent: () => import('./components/blog-studio/blog-studio').then((m) => m.BlogStudio) },
  { path: 'blog-studio/post', data: { view: 'post' }, loadComponent: () => import('./components/blog-studio/blog-studio').then((m) => m.BlogStudio) },
  { path: 'form-builder', loadComponent: () => import('./components/form-builder/form-builder').then((m) => m.FormBuilder) },
  { path: 'reading-tracker', loadComponent: () => import('./components/reading-tracker/reading-tracker').then((m) => m.ReadingTracker) },
  { path: 'country-explorer', loadComponent: () => import('./components/api-projects/country-explorer').then((m) => m.CountryExplorer) },
  { path: 'weather-dashboard', loadComponent: () => import('./components/api-projects/weather-dashboard').then((m) => m.WeatherDashboard) },
  { path: 'currency-converter', loadComponent: () => import('./components/api-projects/currency-converter').then((m) => m.CurrencyConverter) },
  { path: 'book-discovery', loadComponent: () => import('./components/api-projects/book-discovery').then((m) => m.BookDiscovery) },
  { path: 'github-profile-explorer', loadComponent: () => import('./components/api-projects/github-explorer').then((m) => m.GithubExplorer) },
];






