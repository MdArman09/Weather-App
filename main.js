let isCelsius = true;

async function getWeather() {
  const location = document.getElementById("location").value.trim();
  const apiKey = "YOUR_API_KEY_HERE";

  if (!location) {
    document.getElementById("result").innerText = "Please enter a location";
    return;
  }

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=5&aqi=yes`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      document.getElementById("result").innerText = "Location not found";
      return;
    }

    const current = data.current;
    const forecastDays = data.forecast.forecastday;
    let startIndex = forecastDays.findIndex(day => day.date === formattedDate);
    if (startIndex !== -1) startIndex += 1;

    const next4Days = forecastDays.slice(startIndex, startIndex + 4);
    const currentDateFormatted = formatFullDate(today);
    const currentTime = today.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit"
    });

    document.getElementById("result").innerHTML = `
      📅 Date: ${currentDateFormatted} | 🕒 Time: ${currentTime}<br>
      🌍 ${data.location.name}, ${data.location.country}<br>
      🌡️ Temperature: ${convertTemp(current.temp_c, current.temp_f)}<br>
      🤔 Feels Like: ${convertTemp(current.feelslike_c, current.feelslike_f)}<br>
      💧 Humidity: ${current.humidity}%<br>
      🌬️ Wind Speed: ${convertWind(current.wind_kph)}<br>
      ☁️ Condition: ${current.condition.text}<br>
      🌅 Sunrise: ${formatTime(forecastDays[0]?.astro.sunrise)}<br>
      🌇 Sunset: ${formatTime(forecastDays[0]?.astro.sunset)}<br>
      💦 Dew Point: ${convertTemp(current.dewpoint_c, current.dewpoint_f)}<br>
      👀 Visibility: ${convertVisibility(current.vis_km)}
    `;

    document.getElementById("weather-icon").src = "https:" + current.condition.icon;
    document.getElementById("weather-icon").style.display = "block";

    displayForecast(next4Days);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    document.getElementById("result").innerText = "Error fetching weather data";
  }
}

function displayForecast(forecastData) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  forecastData.forEach(day => {
    const dateFormatted = formatFullDate(new Date(day.date));
    const temp = isCelsius ? day.day.avgtemp_c : day.day.avgtemp_f;
    const forecastItem = document.createElement("div");
    forecastItem.innerHTML = `<strong>${dateFormatted}</strong><br>🌡️ ${temp}°${isCelsius ? "C" : "F"}`;
    forecastItem.onclick = () => showForecastDetails(day);
    forecastContainer.appendChild(forecastItem);
  });
}

function showForecastDetails(day) {
  document.getElementById("main-page").style.display = "none";
  document.getElementById("forecast-details").style.display = "block";

  document.getElementById("forecast-date").innerText = `📅 Date: ${formatFullDate(new Date(day.date))}`;
  document.getElementById("forecast-temp").innerText = `🌡️ Temperature: ${convertTemp(day.day.avgtemp_c, day.day.avgtemp_f)}`;
  document.getElementById("forecast-feels").innerText = `🤔 Feels Like: ${convertTemp(day.day.maxtemp_c, day.day.maxtemp_f)}`;
  document.getElementById("forecast-humidity").innerText = `💧 Humidity: ${day.day.avghumidity}%`;
  document.getElementById("forecast-wind").innerText = `🌬️ Wind Speed: ${convertWind(day.day.maxwind_kph)}`;
  document.getElementById("forecast-condition").innerText = `☁️ Condition: ${day.day.condition.text}`;
  document.getElementById("forecast-sunrise").innerText = `🌅 Sunrise: ${formatTime(day.astro.sunrise)}`;
  document.getElementById("forecast-sunset").innerText = `🌇 Sunset: ${formatTime(day.astro.sunset)}`;
  document.getElementById("forecast-dew").innerText = `💦 Dew Point: ${convertTemp(day.hour[12].dewpoint_c, day.hour[12].dewpoint_f)}`;
  document.getElementById("forecast-visibility").innerText = `👀 Visibility: ${convertVisibility(day.day.avgvis_km)}`;
}

function goBack() {
  document.getElementById("main-page").style.display = "block";
  document.getElementById("forecast-details").style.display = "none";
}

function toggleTemperatureUnit() {
  isCelsius = !isCelsius;
  getWeather();
}

function convertTemp(celsius, fahrenheit) {
  return isCelsius ? `${celsius}°C` : `${fahrenheit}°F`;
}

function convertWind(kph) {
  return isCelsius ? `${kph} kph` : `${(kph / 1.609).toFixed(2)} mph`;
}

function convertVisibility(km) {
  return isCelsius ? `${km} km` : `${(km / 1.609).toFixed(2)} miles`;
}

function formatTime(time) {
  return time ? time : "N/A";
}

function formatFullDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
