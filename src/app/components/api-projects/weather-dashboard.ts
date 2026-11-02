import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Place {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}
interface Weather {
  timezone?: string;
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
    precipitation_probability_max?: number[];
  };
}
@Component({
  selector: 'app-weather-dashboard',
  imports: [FormsModule],
  styleUrls: ['../practice-labs.css', './api-projects.css'],
  templateUrl: './weather-dashboard.html',
})
export class WeatherDashboard {
  protected query = '';
  protected readonly places = signal<Place[]>([]);
  protected readonly place = signal<Place | null>(null);
  protected readonly weather = signal<Weather | null>(null);
  protected readonly status = signal('Search for a city to begin.');
  private request = 0;
  protected async search(): Promise<void> {
    const query = this.query.trim();
    if (!query) {
      this.status.set('Enter a city name.');
      return;
    }
    const id = ++this.request;
    this.places.set([]);
    this.place.set(null);
    this.weather.set(null);
    this.status.set('Searching locations…');
    try {
      const response = await fetch(
        'https://geocoding-api.open-meteo.com/v1/search?' +
          new URLSearchParams({ name: query, count: '10', language: 'en', format: 'json' }),
      );
      if (!response.ok) throw new Error('City search is unavailable. Please try again.');
      const data = (await response.json()) as { results?: Place[] };
      if (id !== this.request) return;
      const places = (data.results || []).filter(
        (item) => typeof item.latitude === 'number' && typeof item.longitude === 'number',
      );
      this.places.set(places);
      this.status.set(
        places.length
          ? 'Choose a location to see its weather.'
          : 'No matching cities found. Try another name.',
      );
    } catch {
      if (id === this.request)
        this.status.set('Could not load locations. Check your connection and try again.');
    }
  }
  protected async choose(place: Place): Promise<void> {
    const id = ++this.request;
    this.place.set(place);
    this.weather.set(null);
    this.status.set('Loading forecast…');
    const params = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current:
        'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: '7',
    });
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?' + params);
      if (!response.ok) throw new Error('Forecast unavailable');
      const data = (await response.json()) as Weather;
      if (id !== this.request) return;
      if (!data.current || !data.daily) throw new Error('Incomplete forecast');
      this.weather.set(data);
      this.status.set('Forecast loaded.');
    } catch {
      if (id === this.request)
        this.status.set('Could not load the forecast. Choose the location to retry.');
    }
  }
  protected label(code?: number): string {
    if (code === 0) return 'Clear sky';
    if (code === 1 || code === 2) return 'Partly cloudy';
    if (code === 3) return 'Cloudy';
    if (code === 45 || code === 48) return 'Fog';
    if (code !== undefined && code >= 51 && code <= 67) return 'Rain or drizzle';
    if (code !== undefined && code >= 71 && code <= 77) return 'Snow';
    if (code !== undefined && code >= 80 && code <= 86) return 'Showers';
    if (code !== undefined && code >= 95) return 'Thunderstorm';
    return 'Conditions unavailable';
  }
  protected value(n: number | undefined, suffix: string): string {
    return typeof n === 'number' && Number.isFinite(n) ? `${n}${suffix}` : 'Not available';
  }
}
