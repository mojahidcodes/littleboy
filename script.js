(function () {
  'use strict';

  // Map Open-Meteo WMO weather codes to short human-readable descriptions.
  const WEATHER_CODES = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Fog',
    51: 'Drizzle',
    53: 'Drizzle',
    55: 'Drizzle',
    61: 'Rain',
    63: 'Rain',
    65: 'Rain',
    71: 'Snow',
    73: 'Snow',
    75: 'Snow',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Rain showers',
    95: 'Thunderstorm'
  };

  function describeWeather(code) {
    return Object.prototype.hasOwnProperty.call(WEATHER_CODES, code)
      ? WEATHER_CODES[code]
      : 'Unknown';
  }

  // DOM references
  const form = document.getElementById('search-form');
  const cityInput = document.getElementById('city-input');
  const messageEl = document.getElementById('message');
  const weatherEl = document.getElementById('weather');
  const cityNameEl = document.getElementById('city-name');
  const temperatureEl = document.getElementById('temperature');
  const descriptionEl = document.getElementById('description');

  function setMessage(text, isError) {
    if (!messageEl) return;
    messageEl.textContent = text;
    if (isError) {
      messageEl.classList.add('error');
    } else {
      messageEl.classList.remove('error');
    }
  }

  async function handleSearch(city) {
    const trimmed = (city || '').trim();
    if (!trimmed) {
      setMessage('Please enter a city name.', true);
      return;
    }

    try {
      setMessage('Looking up...');

      const geoUrl =
        'https://geocoding-api.open-meteo.com/v1/search?name=' +
        encodeURIComponent(trimmed) +
        '&count=1';
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) {
        throw new Error('Geocoding request failed: ' + geoRes.status);
      }
      const geoData = await geoRes.json();

      if (!geoData || !Array.isArray(geoData.results) || geoData.results.length === 0) {
        setMessage('City not found', true);
        return;
      }

      const first = geoData.results[0];
      const name = first.name || trimmed;
      const country = first.country;
      const latitude = first.latitude;
      const longitude = first.longitude;

      const forecastUrl =
        'https://api.open-meteo.com/v1/forecast?latitude=' +
        encodeURIComponent(latitude) +
        '&longitude=' +
        encodeURIComponent(longitude) +
        '&current_weather=true&temperature_unit=celsius';
      const forecastRes = await fetch(forecastUrl);
      if (!forecastRes.ok) {
        throw new Error('Forecast request failed: ' + forecastRes.status);
      }
      const forecastData = await forecastRes.json();

      const current = forecastData && forecastData.current_weather;
      if (!current || typeof current.temperature !== 'number') {
        throw new Error('Forecast response missing current weather.');
      }

      const temperature = current.temperature;
      const description = describeWeather(current.weathercode);

      if (cityNameEl) {
        cityNameEl.textContent = country ? `${name}, ${country}` : name;
      }
      if (temperatureEl) {
        temperatureEl.textContent = `${temperature} °C`;
      }
      if (descriptionEl) {
        descriptionEl.textContent = description;
      }
      if (weatherEl) {
        weatherEl.classList.remove('hidden');
      }

      setMessage('');
    } catch (err) {
      setMessage('Failed to fetch weather. Please try again.', true);
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  if (form && cityInput) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      handleSearch(cityInput.value);
    });

    if (cityInput.value && cityInput.value.trim() !== '') {
      handleSearch(cityInput.value);
    }
  }
})();
