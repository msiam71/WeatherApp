const API_KEY = '53bc29f3474f49ecac7125101251804';
const DEFAULT_CITY = 'Dhaka';

// ========== ELEMENTS ==========
const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const detectLocationButton = document.getElementById('detectLocationButton');
const timeDisplay = document.getElementById('liveTime');
const cityNameDisplay = document.getElementById('cityName');
const rainChanceDisplay = document.getElementById('rainChance');
const tempDisplay = document.getElementById('tempDisplay');
const iconDisplay = document.getElementById('weatherIcon');
const realFeelDisplay = document.getElementById('realFeel');
const windSpeedDisplay = document.getElementById('windSpeed');
const uvIndexDisplay = document.getElementById('uvIndex');
const hourlyContainer = document.getElementById('hourlyForecast');
const weeklyContainer = document.getElementById('weeklyForecast');
const favoriteList = document.getElementById('favoriteList');

// ========== LIVE CLOCK ==========
setInterval(() => {
  timeDisplay.textContent = new Date().toLocaleTimeString();
}, 1000);

// ========== WEATHER FETCH ==========
async function fetchWeather(query) {
  try {
    const url = typeof query === 'string'
      ? `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=7`
      : `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query.lat},${query.lon}&days=7`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      alert(data.error.message);
      return;
    }

    // Current
    cityNameDisplay.textContent = data.location.name;
    rainChanceDisplay.textContent = `Chance of rain: ${data.forecast.forecastday[0].day.daily_chance_of_rain}%`;
    tempDisplay.textContent = `${data.current.temp_c}°C`;
    iconDisplay.src = `https:${data.current.condition.icon}`;
    iconDisplay.alt = data.current.condition.text;
    realFeelDisplay.textContent = `${data.current.feelslike_c}°C`;
    windSpeedDisplay.textContent = `${data.current.wind_kph} km/h`;
    uvIndexDisplay.textContent = data.current.uv;

    // Next 12 Hours
    hourlyContainer.innerHTML = '';
    const currentHour = new Date(data.location.localtime).getHours();
    for (let i = 0; i < 12; i++) {
      const hourData = data.forecast.forecastday[0].hour[(currentHour + i) % 24];
      hourlyContainer.innerHTML += `
        <div class="hour-card">
          <p>${hourData.time.split(' ')[1]}</p>
          <img src="https:${hourData.condition.icon}" alt="${hourData.condition.text}">
          <p>${hourData.temp_c}°C</p>
        </div>
      `;
    }

    // Weekly
    weeklyContainer.innerHTML = '';
    data.forecast.forecastday.forEach(day => {
      const weekday = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
      weeklyContainer.innerHTML += `
        <div class="week-day">
          <span>${weekday}</span>
          <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
          <span>${day.day.maxtemp_c}° / ${day.day.mintemp_c}°</span>
        </div>
      `;
    });
  } catch (err) {
    console.error('Weather fetch error:', err);
  }
}

// ========== FAVORITES ==========
function saveFavorite(city) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
  }
}

function renderFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favoriteList.innerHTML = '';
  favorites.forEach(city => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${city}</span>
      <button onclick="removeFavorite('${city}')">X</button>
    `;
    li.querySelector('span').addEventListener('click', () => fetchWeather(city));
    favoriteList.appendChild(li);
  });
}

function removeFavorite(city) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const updated = favorites.filter(fav => fav !== city);
  localStorage.setItem('favorites', JSON.stringify(updated));
  renderFavorites();
}

// ========== SEARCH ==========
searchButton.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
    saveFavorite(city);
    cityInput.value = '';
  }
});

// ========== DETECT LOCATION BUTTON ==========
detectLocationButton.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };
        fetchWeather(coords);
      },
      () => {
        alert('Unable to retrieve your location.');
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
});

// ========== INIT ==========
fetchWeather(DEFAULT_CITY);
renderFavorites();




















