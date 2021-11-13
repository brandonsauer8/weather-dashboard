function start() {
  var cityEl = document.getElementById("enter-city");
  var searchEl = document.getElementById("search-button");
  var clearEl = document.getElementById("clear-history");
  var nameEl = document.getElementById("city-name");
  var iconEl = document.getElementById("current-icon");
  var currentTempEl = document.getElementById("temperature");
  var currentHumidEl = document.getElementById("humidity");
  var currentWindEl = document.getElementById("wind-speed");
  var currentUVEl = document.getElementById("UV-index");
  var searchHistoryEl = document.getElementById("history");
  var fivedayEl = document.getElementById("fiveday");
  var todayEl = document.getElementById("today");
  var searchHistory = JSON.parse(localStorage.getItem("search")) || [];

  // API Key
  var apiKey = "84b79da5e5d7c92085660485702f4ce8";

  function getWeather(cityName) {
    // Get request from open weather API
    var queryURL =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      cityName +
      "&appid=" +
      apiKey;
    axios.get(queryURL).then(function (response) {
      todayEl.classList.remove("d-none");

      var currentDate = new Date(response.data.dt * 1000);
      var day = currentDate.getDate();
      var month = currentDate.getMonth() + 1;
      var year = currentDate.getFullYear();
      nameEl.innerHTML =
        response.data.name + " (" + month + "/" + day + "/" + year + ") ";
      var icon = response.data.weather[0].icon;
      iconEl.setAttribute(
        "src",
        "https://openweathermap.org/img/wn/" + icon + "@2x.png"
      );
      iconEl.setAttribute("alt", response.data.weather[0].description);
      currentTempEl.innerHTML =
        "Temperature: " + k2f(response.data.main.temp) + " &#176F";
      currentHumidEl.innerHTML =
        "Humidity: " + response.data.main.humidity + "%";
      currentWindEl.innerHTML =
        "Wind Speed: " + response.data.wind.speed + " MPH";

      // UV Index
      var lat = response.data.coord.lat;
      var lon = response.data.coord.lon;
      var UVQueryURL =
        "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" +
        lat +
        "&lon=" +
        lon +
        "&appid=" +
        apiKey +
        "&cnt=1";
      axios.get(UVQueryURL).then(function (response) {
        var UVIndex = document.createElement("span");

        // Shows when UV is good or bad
        if (response.data[0].value < 4) {
          UVIndex.setAttribute("class", "badge badge-success");
        } else if (response.data[0].value < 8) {
          UVIndex.setAttribute("class", "badge badge-warning");
        } else {
          UVIndex.setAttribute("class", "badge badge-danger");
        }
        UVIndex.innerHTML = response.data[0].value;
        currentUVEl.innerHTML = "UV Index: ";
        currentUVEl.append(UVIndex);
      });

      // 5 day forecast
      var cityID = response.data.id;
      var forecastQueryURL =
        "https://api.openweathermap.org/data/2.5/forecast?id=" +
        cityID +
        "&appid=" +
        apiKey;
      axios.get(forecastQueryURL).then(function (response) {
        fivedayEl.classList.remove("d-none");

        var forecasts = document.querySelectorAll(".forecast");
        for (i = 0; i < forecasts.length; i++) {
          forecasts[i].innerHTML = "";
          var forecastIndex = i * 8 + 4;
          var forecastDate = new Date(
            response.data.list[forecastIndex].dt * 1000
          );
          var forecastDay = forecastDate.getDate();
          var forecastMonth = forecastDate.getMonth() + 1;
          var forecastYear = forecastDate.getFullYear();
          var forecastDateEl = document.createElement("p");
          forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
          forecastDateEl.innerHTML =
            forecastMonth + "/" + forecastDay + "/" + forecastYear;
          forecasts[i].append(forecastDateEl);

          // Current weather image
          var forecastWeatherEl = document.createElement("img");
          forecastWeatherEl.setAttribute(
            "src",
            "https://openweathermap.org/img/wn/" +
              response.data.list[forecastIndex].weather[0].icon +
              "@2x.png"
          );
          forecastWeatherEl.setAttribute(
            "alt",
            response.data.list[forecastIndex].weather[0].description
          );
          forecasts[i].append(forecastWeatherEl);
          var forecastTempEl = document.createElement("p");
          forecastTempEl.innerHTML =
            "Temp: " +
            k2f(response.data.list[forecastIndex].main.temp) +
            " &#176F";
          forecasts[i].append(forecastTempEl);
          var forecastHumidityEl = document.createElement("p");
          forecastHumidityEl.innerHTML =
            "Humidity: " +
            response.data.list[forecastIndex].main.humidity +
            "%";
          forecasts[i].append(forecastHumidityEl);
        }
      });
    });
  }

  // Get history from local storage if any
  searchEl.addEventListener("click", function () {
    var searchWord = cityEl.value;
    getWeather(searchWord);
    searchHistory.push(searchWord);
    localStorage.setItem("search", JSON.stringify(searchHistory));
    showSearchHistory();
  });

  // Clear History button
  clearEl.addEventListener("click", function () {
    localStorage.clear();
    searchHistory = [];
    showSearchHistory();
  });

  function k2f(K) {
    return Math.floor((K - 273.15) * 1.8 + 32);
  }

  function showSearchHistory() {
    searchHistoryEl.innerHTML = "";
    for (var i = 0; i < searchHistory.length; i++) {
      var historyItem = document.createElement("input");
      historyItem.setAttribute("type", "button");
      historyItem.setAttribute("readonly", true);
      historyItem.setAttribute("class", "form-control d-block bg-white");
      historyItem.setAttribute("value", searchHistory[i]);
      historyItem.addEventListener("click", function () {
        getWeather(historyItem.value);
      });
      searchHistoryEl.append(historyItem);
    }
  }

  showSearchHistory();
  if (searchHistory.length > 0) {
    getWeather(searchHistory[searchHistory.length - 1]);
  }
}

start();
