const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const results = document.getElementById('results');

const weatherCodes = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Drizzle (light)',
  53: 'Drizzle (moderate)',
  55: 'Drizzle (dense)',
  61: 'Rain (slight)',
  63: 'Rain (moderate)',
  65: 'Rain (heavy)',
  71: 'Snow (slight)',
  73: 'Snow (moderate)',
  75: 'Snow (heavy)',
  80: 'Rain showers (slight)',
  81: 'Rain showers (moderate)',
  82: 'Rain showers (violent)',
  95: 'Thunderstorm',
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  await fetchWeather(city);
});

async function fetchWeather(city) {
  results.innerHTML = '';
  results.classList.remove('error');

  const loading = document.createElement('p');
  loading.className = 'loading';
  loading.textContent = 'Loading…';
  results.appendChild(loading);

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    if (!geoResponse.ok) {
      throw new Error('Could not look up that city. Please try again.');
    }
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`No results found for "${city}".`);
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    if (!weatherResponse.ok) {
      throw new Error('Could not fetch weather data. Please try again.');
    }
    const weatherData = await weatherResponse.json();
    const current = weatherData.current_weather;

    const temperature = Math.round(current.temperature);
    const description = weatherCodes[current.weathercode] || 'Unknown';

    results.innerHTML = '';

    const heading = document.createElement('h2');
    heading.textContent = `${name}, ${country}`;

    const tempEl = document.createElement('p');
    tempEl.className = 'temp';
    tempEl.textContent = `${temperature}°C`;

    const descEl = document.createElement('p');
    descEl.className = 'desc';
    descEl.textContent = description;

    results.append(heading, tempEl, descEl);
  } catch (error) {
    results.innerHTML = '';
    const errorEl = document.createElement('p');
    errorEl.className = 'error';
    errorEl.textContent = error.message;
    results.appendChild(errorEl);
  }
}
