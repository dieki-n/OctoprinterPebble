/* global Pebble, localStorage */

var Clay = require('./clay.js');
var clayConfig = require('./config.js');
var clay = new Clay(clayConfig, null, {autoHandleEvents: false});

var keys = {
  printer_url : 0,
  api_key : 1,
  printer_celcius : 2,
  weather_celcius : 3
};


Pebble.addEventListener('showConfiguration', function(e) {
  Pebble.openURL(clay.generateUrl());
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e && !e.response) {
    return;
  }
  var dict = clay.getSettings(e.response);
  localStorage.setItem(keys.printer_url, dict.printer_url);
  localStorage.setItem(keys.api_key, dict.octoprint_api);
});

var WEATHER_API_KEY = "93a9fb28f040a6e1981c9ac44fd2cba2";

Pebble.on('message', function(event){
  var message = event.data;
  if (message.fetch){
    
    var url = "http://" + localStorage.getItem(keys.printer_url) + "/api/job?apikey=" + localStorage.getItem(keys.api_key);
    console.log(url);
    request(url, 'GET', function(respText){
      console.log("Received printer data");
      console.log(respText);
      var printerData = JSON.parse(respText);
      Pebble.postMessage({
        'type'       : 'printerProgress',
        'progress'   : printerData.progress.completion,
        'time_left'  : printerData.progress.printTimeLeft,
        'filename'   : printerData.job.file.name,
        'state'      : printerData.state
      });
    });
    
    url = "http://" + localStorage.getItem(keys.printer_url) + "/api/printer?apikey=" + localStorage.getItem(keys.api_key);
    request(url, 'GET', function(respText){
      console.log("Received printer temp data");
      console.log(respText);
      var printerData = JSON.parse(respText);
      Pebble.postMessage({
        'type'        : 'printerTemp',
        'nozzle_temp' : printerData.temperature.tool0.actual,
        'bed_temp'    : printerData.temperature.bed.actual
      });
    });
  } else if (message.fetch_weather){
    navigator.geolocation.getCurrentPosition(function(pos) {
      var url = 'http://api.openweathermap.org/data/2.5/weather' +
              '?lat=' + pos.coords.latitude +
              '&lon=' + pos.coords.longitude +
              '&appid=' + WEATHER_API_KEY;

      request(url, 'GET', function(respText) {
        console.log(respText);
        var weatherData = JSON.parse(respText);
        Pebble.postMessage({
            'type'    : 'weather',
            'temp'    : Math.round((weatherData.main.temp - 273.15) * 9 / 5 + 32),
            'desc'    : weatherData.weather[0].main
          });
        });
    }, function(err) {
      console.error('Error getting location');
    },{ timeout: 15000, maximumAge: 60000 });
  }
});

function request(url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function (e) {
    // HTTP 4xx-5xx are errors:
    if (xhr.status >= 400 && xhr.status < 600) {
      console.error('Request failed with HTTP status ' + xhr.status + ', body: ' + this.responseText);
      return;
    }
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
}