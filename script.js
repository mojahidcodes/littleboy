// Cache references to the input, button, and results DOM nodes.
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const resultsArea = document.getElementById('results');

// WMO weather code -> short human-readable description.
const WEATHER_DESCRIPTIONS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

function describeWeather(code) {
  if (Object.prototype.hasOwnProperty.call(WEATHER_DESCRIPTIONS, code)) {
    return WEATHER_DESCRIPTIONS[code];
  }
  return 'Unknown conditions';
}

function renderError(message) {
  resultsArea.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'error';
  p.textContent = message;
  resultsArea.appendChild(p);
}

function renderWeather(cityName, country, temperature, description) {
  resultsArea.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'weather';

  const location = document.createElement('h2');
  location.textContent = `${cityName}, ${country}`;
  container.appendChild(location);

  const temp = document.createElement('p');
  temp.className = 'temperature';
  temp.textContent = `${temperature.toFixed(1)} °C`;
  container.appendChild(temp);

  const desc = document.createElement('p');
  desc.className = 'description';
  desc.textContent = description;
  container.appendChild(desc);

  resultsArea.appendChild(container);
}

async function getWeather() {
  const city = cityInput.value.trim();
  resultsArea.innerHTML = '';

  if (!city) {
    renderError('Please enter a city name.');
    return;
  }

  try {
    // Step 1: Geocode the city to get coordinates + display name.
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) {
      throw new Error('Geocoding request failed');
    }
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      renderError('City not found');
      return;
    }

    const match = geoData.results[0];
    const { latitude, longitude, name, country } = match;

    // Step 2: Fetch current weather for those coordinates.
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error('Weather request failed');
    }
    const weatherData = await weatherResponse.json();

    const temperature = weatherData.current_weather.temperature;
    const weatherCode = weatherData.current_weather.weathercode;
    const description = describeWeather(weatherCode);

    renderWeather(name, country, temperature, description);
  } catch (err) {
    renderError('Unable to retrieve weather data. Please try again later.');
  }
}

searchButton.addEventListener('click', getWeather);
cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    getWeather();
  }
});
