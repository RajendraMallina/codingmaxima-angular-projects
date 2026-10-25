import { StopWatch } from './components/stop-watch/stop-watch';
import { MultiCategoryUnit } from './components/multi-category-unit/multi-category-unit';
import { GuessNumber } from './components/guess-number/guess-number';
import { DigitalClock } from './components/digital-clock/digital-clock';
import { RandomQuoteCollection } from './components/random-quote-collection/random-quote-collection';
import { CentimeterFeetsInches } from './components/centimeter-feets-inches/centimeter-feets-inches';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { KilogramsPounds } from './components/kilograms-pounds/kilograms-pounds';
import { CentimeterFeets } from './components/centimeter-feets/centimeter-feets';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should open the kilograms converter by its route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/kilograms-pounds', KilogramsPounds);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent)
      .toBe('Kilograms and Pounds Converter');
  });

  it('should open the centimeters converter by its route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/centimeter-feets', CentimeterFeets);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent)
      .toBe('Centimeters and Feet Converter');
  });
  it('should open the centimeters, feet, and inches converter by its route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/centimeter-feets-inches', CentimeterFeetsInches);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent)
      .toBe('Centimeters, Feet, and Inches Converter');
  });
  it('should open the random quote collection by its route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/random-quote-collection', RandomQuoteCollection);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent)
      .toBe('Random Quote Collection');
  });
  it('should open the digital clock by its route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/digital-clock', DigitalClock);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Digital Clock');
  });
  it('should open the guessing game by its route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/guess-number', GuessNumber);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Guess the Number Game');
  });
  it('should open the multi-category unit converter by its route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/multi-category-unit', MultiCategoryUnit);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Multi-Category Unit Converter');
  });
  it('should open the stopwatch by its route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/stop-watch', StopWatch);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Stopwatch');
  });
});
