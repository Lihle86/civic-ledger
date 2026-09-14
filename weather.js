// Weather Dashboard - OpenWeatherMap API Integration
// Get your free API key from: https://openweathermap.org/api

const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const elements = {
  cityInput: document.getElementById('cityInput'),
  searchBtn: document.getElementById('searchBtn'),
  locationBtn: document.getElementById('locationBtn'),
  refreshBtn: document.getElementById('refreshBtn'),
  weatherCard: document.getElementById('weatherCard'),
  errorMessage: document.getElementById('errorMessage'),
  cityName: document.getElementById('cityName'),
  temperature: document.getElementById('temperature'),
  feelsLike: document.getElementById('feelsLike'),
  weatherDescription: document.getElementById('weatherDescription'),
  humidity: document.getElementById('humidity'),
  windSpeed: document.getElementById('windSpeed'),
  pressure: document.getElementById('pressure'),
  uvIndex: document.getElementById('uvIndex'),
  visibility: document.getElementById('visibility'),
  weatherIcon: document.getElementById('weatherIcon'),
  forecastContainer: document.getElementById('forecastContainer'),
  sunrise: document.getElementById('sunrise'),
  sunset: document.getElementById('sunset')
};

let currentCity = 'Cape Town'; // Default city
let currentWeatherData = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  elements.searchBtn.addEventListener('click', handleSearch);
  elements.locationBtn.addEventListener('click', handleLocationSearch);
  elements.refreshBtn.addEventListener('click', () => fetchWeather(currentCity));
  elements.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  // Load default weather on page load
  fetchWeather(currentCity);
});

function handleSearch() {
  const city = elements.cityInput.value.trim();
  if (city) {
    currentCity = city;
    fetchWeather(city);
  }
}

function handleLocationSearch() {
  if (navigator.geolocation) {
    elements.searchBtn.disabled = true;
    elements.searchBtn.textContent = 'Getting location...';
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoordinates(latitude, longitude);
        elements.searchBtn.disabled = false;
        elements.searchBtn.textContent = 'Search';
      },
      (error) => {
        showError('Unable to access your location. Please enable location services.');
        elements.searchBtn.disabled = false;
        elements.searchBtn.textContent = 'Search';
      }
    );
  } else {
    showError('Geolocation is not supported by your browser.');
  }
}

async function fetchWeather(city) {
  try {
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
      showError('Please configure your OpenWeatherMap API key in weather.js');
      return;
    }

    hideError();
    
    // Fetch current weather
    const weatherResponse = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );
    
    if (!weatherResponse.ok) {
      throw new Error('City not found');
    }
    
    const weatherData = await weatherResponse.json();
    currentWeatherData = weatherData;
    
    // Fetch forecast
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );
    const forecastData = await forecastResponse.json();
    
    // Display weather
    displayWeather(weatherData, forecastData);
    
  } catch (error) {
    showError(error.message || 'Error fetching weather data');
    console.error('Weather fetch error:', error);
  }
}

async function fetchWeatherByCoordinates(lat, lon) {
  try {
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
      showError('Please configure your OpenWeatherMap API key in weather.js');
      return;
    }

    hideError();
    
    // Fetch current weather
    const weatherResponse = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    const weatherData = await weatherResponse.json();
    currentWeatherData = weatherData;
    currentCity = weatherData.name;
    elements.cityInput.value = currentCity;
    
    // Fetch forecast
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    const forecastData = await forecastResponse.json();
    
    displayWeather(weatherData, forecastData);
    
  } catch (error) {
    showError('Error fetching weather data');
    console.error('Weather fetch error:', error);
  }
}

function displayWeather(weatherData, forecastData) {
  // Current weather
  elements.cityName.textContent = `${weatherData.name}, ${weatherData.sys.country}`;
  elements.temperature.textContent = `${Math.round(weatherData.main.temp)}°C`;
  elements.feelsLike.textContent = `${Math.round(weatherData.main.feels_like)}°C`;
  elements.weatherDescription.textContent = weatherData.weather[0].description;
  elements.humidity.textContent = `${weatherData.main.humidity}%`;
  elements.windSpeed.textContent = `${(weatherData.wind.speed * 3.6).toFixed(1)} km/h`;
  elements.pressure.textContent = `${weatherData.main.pressure} hPa`;
  elements.visibility.textContent = `${(weatherData.visibility / 1000).toFixed(1)} km`;
  
  // Weather icon
  const iconUrl = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`;
  elements.weatherIcon.src = iconUrl;
  elements.weatherIcon.alt = weatherData.weather[0].description;
  
  // Sunrise and Sunset
  const sunrise = new Date(weatherData.sys.sunrise * 1000);
  const sunset = new Date(weatherData.sys.sunset * 1000);
  elements.sunrise.textContent = sunrise.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  elements.sunset.textContent = sunset.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  
  // UV Index calculation (simplified - you can integrate OWM UV API for more accuracy)
  const hour = new Date().getHours();
  const uvEstimate = hour >= 9 && hour <= 17 ? Math.min(weatherData.clouds / 15 + 2, 10) : 0;
  elements.uvIndex.textContent = uvEstimate.toFixed(1);
  
  // Display forecast
  displayForecast(forecastData);
  
  // Show weather card
  elements.weatherCard.classList.remove('hidden');
}

function displayForecast(forecastData) {
  const dailyData = {};
  
  // Group forecast data by day
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-ZA');
    if (!dailyData[date]) {
      dailyData[date] = item;
    }
  });
  
  // Display up to 5 days
  const days = Object.entries(dailyData).slice(0, 5);
  elements.forecastContainer.innerHTML = days.map(([date, data]) => {
    const day = new Date(data.dt * 1000).toLocaleDateString('en-ZA', { weekday: 'short' });
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    return `
      <div class="forecast-card">
        <div class="forecast-day">${day}</div>
        <img src="${iconUrl}" alt="${data.weather[0].description}" class="forecast-icon">
        <div class="forecast-temps">
          <div class="forecast-high">${Math.round(data.main.temp_max)}°</div>
          <div class="forecast-low">${Math.round(data.main.temp_min)}°</div>
        </div>
      </div>
    `;
  }).join('');
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.classList.remove('hidden');
}

function hideError() {
  elements.errorMessage.classList.add('hidden');
  elements.errorMessage.textContent = '';
}
