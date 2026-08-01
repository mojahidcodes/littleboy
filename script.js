(function () {
  'use strict';

  // Mapping of WMO weather codes to human-readable descriptions.
  // Source: https://open-meteo.com/en/docs
  const WMO_DESCRIPTIONS = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Fog',
    51: 'Drizzle: light',
    53: 'Drizzle: moderate',
    55: 'Drizzle: dense',
    56: 'Freezing drizzle',
    57: 'Freezing drizzle',
    61: 'Rain: slight',
    63: 'Rain: moderate',
    65: 'Rain: heavy',
    66: 'Freezing rain',
    67: 'Freezing rain',
    71: 'Snow fall: slight',
    73: 'Snow fall: moderate',
    75: 'Snow fall: heavy',
    77: 'Snow grains',
    80: 'Rain showers: slight',
    81: 'Rain showers: moderate',
    82: 'Rain showers: violent',
    85: 'Snow showers: slight',
    86: 'Snow showers: heavy',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with hail'
  };

  const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

  function describeWeather(code) {
    if (Object.prototype.hasOwnProperty.call(WMO_DESCRIPTIONS, code)) {
      return WMO_DESCRIPTIONS[code];
    }
    return 'Unknown conditions';
  }

  function clearResults() {
    const results = document.getElementById('results');
    if (results) {
      results.textContent = '';
    }
  }

  function showError(message) {
    clearResults();
    const results = document.getElementById('results');
    const p = document.createElement('p');
    p.className = 'error';
    p.textContent = message;
    results.appendChild(p);
  }

  function showMessage(message, className) {
    clearResults();
    const results = document.getElementById('results');
    const p = document.createElement('p');
    p.className = className;
    p.textContent = message;
    results.appendChild(p);
  }

  function renderWeather(place, current) {
    clearResults();
    const results = document.getElementById('results');

    const locationEl = document.createElement('h2');
    const locationParts = [place.name];
    if (place.country) {
      locationParts.push(place.country);
    }
    locationEl.textContent = locationParts.join(', ');
    results.appendChild(locationEl);

    const tempEl = document.createElement('p');
    tempEl.className = 'temperature';
    tempEl.textContent = Math.round(current.temperature) + '°C';
    results.appendChild(tempEl);

    const descEl = document.createElement('p');
    descEl.className = 'description';
    descEl.textContent = describeWeather(current.weathercode);
    results.appendChild(descEl);

    if (typeof current.windspeed === 'number') {
      const windEl = document.createElement('p');
      windEl.className = 'wind';
      windEl.textContent = 'Wind: ' + current.windspeed + ' km/h';
      results.appendChild(windEl);
    }
  }

  async function searchCity() {
    const input = document.getElementById('city-input');
    const city = input ? input.value.trim() : '';

    if (!city) {
      showError('Please enter a city name.');
      return;
    }

    showMessage('Loading weather for "' + city + '"...', 'loading');

    try {
      const geoUrl = GEOCODING_URL
        + '?name=' + encodeURIComponent(city)
        + '&count=1'
        + '&language=en'
        + '&format=json';

      const geoResponse = await fetch(geoUrl);

      if (!geoResponse.ok) {
        showError('City not found.');
        return;
      }

      const geoData = await geoResponse.json();

      if (!geoData || !Array.isArray(geoData.results) || geoData.results.length === 0) {
        showError('City not found.');
        return;
      }

      const place = geoData.results[0];
      const { latitude, longitude } = place;

      const forecastUrl = FORECAST_URL
        + '?latitude=' + encodeURIComponent(latitude)
        + '&longitude=' + encodeURIComponent(longitude)
        + '&current_weather=true';

      const forecastResponse = await fetch(forecastUrl);

      if (!forecastResponse.ok) {
        showError('Could not retrieve weather. Please try again.');
        return;
      }

      const forecastData = await forecastResponse.json();

      if (!forecastData || !forecastData.current_weather) {
        showError('Weather data is unavailable for this location.');
        return;
      }

      renderWeather(place, forecastData.current_weather);
    } catch (err) {
      showError('Something went wrong. Please check your connection and try again.');
    }
  }

  function init() {
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');

    if (searchBtn) {
      searchBtn.addEventListener('click', searchCity);
    }

    if (cityInput) {
      cityInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          searchCity();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
