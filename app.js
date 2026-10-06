    const weatherIcon = document.getElementById("weather-icon");
    const weatherTemperature = document.getElementById("weather-temperature");
    const weatherStatus = document.getElementById("weather-status");
    const weatherRetry = document.getElementById("weather-retry");

    const weatherDescriptions = {
      0: ["Clear sky", "☀️", "🌙"],
      1: ["Mostly clear", "🌤️", "🌙"],
      2: ["Partly cloudy", "⛅", "☁️"],
      3: ["Overcast", "☁️", "☁️"],
      45: ["Foggy", "🌫️", "🌫️"],
      48: ["Icy fog", "🌫️", "🌫️"],
      51: ["Light drizzle", "🌦️", "🌧️"],
      53: ["Drizzle", "🌦️", "🌧️"],
      55: ["Heavy drizzle", "🌧️", "🌧️"],
      56: ["Freezing drizzle", "🌧️", "🌧️"],
      57: ["Heavy freezing drizzle", "🌧️", "🌧️"],
      61: ["Light rain", "🌦️", "🌧️"],
      63: ["Rain", "🌧️", "🌧️"],
      65: ["Heavy rain", "🌧️", "🌧️"],
      66: ["Freezing rain", "🌧️", "🌧️"],
      67: ["Heavy freezing rain", "🌧️", "🌧️"],
      71: ["Light snow", "🌨️", "🌨️"],
      73: ["Snow", "❄️", "❄️"],
      75: ["Heavy snow", "❄️", "❄️"],
      77: ["Snow grains", "🌨️", "🌨️"],
      80: ["Light rain showers", "🌦️", "🌧️"],
      81: ["Rain showers", "🌧️", "🌧️"],
      82: ["Heavy rain showers", "🌧️", "🌧️"],
      85: ["Snow showers", "🌨️", "🌨️"],
      86: ["Heavy snow showers", "❄️", "❄️"],
      95: ["Thunderstorm", "⛈️", "⛈️"],
      96: ["Thunderstorm with hail", "⛈️", "⛈️"],
      99: ["Heavy thunderstorm with hail", "⛈️", "⛈️"]
    };

    function showWeatherError(message) {
      weatherTemperature.textContent = "—°F";
      weatherIcon.textContent = "🌍";
      weatherStatus.textContent = message;
      weatherRetry.hidden = false;
    }

    async function loadWeather(position) {
      const params = new URLSearchParams({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        current: "temperature_2m,weather_code,is_day",
        temperature_unit: "fahrenheit",
        timezone: "auto"
      });

      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (!response.ok) {
          throw new Error(`Weather service returned ${response.status}.`);
        }
        const data = await response.json();
        const current = data.current;
        if (!current || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.weather_code)) {
          throw new Error("The weather service returned an unexpected response.");
        }

        const condition = weatherDescriptions[current.weather_code] || ["Current conditions", "🌡️", "🌡️"];
        const icon = condition[current.is_day ? 1 : 2];
        weatherIcon.textContent = icon;
        weatherTemperature.textContent = `${Math.round(current.temperature_2m)}°F`;
        weatherStatus.textContent = condition[0];
        weatherRetry.hidden = true;
      } catch (error) {
        console.error("Unable to load local weather:", error);
        showWeatherError("Weather is unavailable right now. Please try again.");
      }
    }

    function requestWeather() {
      weatherRetry.hidden = true;
      weatherStatus.textContent = "Getting your local weather…";
      if (!navigator.geolocation) {
        showWeatherError("Location is not supported by this browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        loadWeather,
        (error) => {
          const message = error.code === error.PERMISSION_DENIED
            ? "Hey there 👋 — make sure to enable your location to see your weather."
            : error.code === error.TIMEOUT
              ? "Location lookup timed out. Please try again."
              : "Could not determine your location. Please try again.";
          showWeatherError(message);
        },
        { enableHighAccuracy: false, maximumAge: 600000, timeout: 15000 }
      );
    }

    weatherRetry.addEventListener("click", requestWeather);
    requestWeather();
