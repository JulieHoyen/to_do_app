import { loadJSON } from "./outdoor_pakke/utils_lib/utils_lib.js";

export function getWeather(date, callback) {
  loadJSON(`https://api.open-meteo.com/v1/forecast?latitude=55.68&longitude=12.57&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${date}&end_date=${date}`, callback, dataLoaded);
  // loadJSON henter dataene og sender dem videre til callback-funktionen.
}

function dataLoaded(data) {
  console.log("DATA", data);
  console.log(`WEATHER KODE for dagen: ${Date(data.daily.time[0])} VMO kode: ${data.daily.weathercode[0]}`);
  const weatherCode = 63;
  const icon = wwCodes[weatherCode];
  console.log(`${icon}`);
  console.log(`${weatherCode}`);
}

export const wwCodes = {
  0: "clearsky_day.png",
  1: "fair_day.png",
  2: "partlycloudy_day.png",
  3: "cloudy.png",
  45: "fog.png",
  48: "fog.png",
  // it's raining again👇🏼
  51: "lightrain.png",
  53: "lightrain.png",
  55: "lightrain.png",
  56: "lightsleet.png",
  57: "lightsleet.png",
  61: "lightrain.png",
  63: "rain.png",
  65: "heavyrain.png",
  66: "lightsleet.png",
  67: "lightsleet.png",
  71: "lightsnow.png",
  73: "snow.png",
  75: "heavysnow.png",
  77: "lightsnow.png",
  80: "lightrainshowers_day.png",
  81: "rainshowers_day.png",
  82: "heavyrainshowers_day.png",
  85: "lightsnowshowers_day.png",
  86: "heavysnowshowers_day.png",
  95: "rainandthunder.png",
};
