// WMO weather code -> short description
const WMO_CODES = {
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
};

function describeWeather(code) {
  return WMO_CODES[code] || 'Unknown conditions';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#weather-form');
  const input = document.querySelector('#city');
  const results = document.querySelector('#results');

  if (!form || !input || !results) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const city = input.value.trim();
    if (!city) {
      results.textContent = 'Please enter a city name.';
      return;
    }

    results.textContent = 'Loading...';

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) {
        throw new Error(`Geocoding request failed: ${geoResponse.status}`);
      }
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        results.textContent = 'City not found.';
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
      const forecastResponse = await fetch(forecastUrl);
      if (!forecastResponse.ok) {
        throw new Error(`Forecast request failed: ${forecastResponse.status}`);
      }
      const forecastData = await forecastResponse.json();

      if (!forecastData.current_weather) {
        throw new Error('No current weather data available.');
      }

      const { temperature, weathercode } = forecastData.current_weather;
      const description = describeWeather(weathercode);
      const place = country ? `${name}, ${country}` : name;

      results.textContent = `City: ${place} | Temperature: ${temperature}°C | Conditions: ${description}`;
    } catch (error) {
      results.textContent = `Error: ${error.message}`;
    }
  });
});
